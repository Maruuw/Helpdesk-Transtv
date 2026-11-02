/**
 * API Service - TRANS TV Helpdesk
 * Menghubungkan Frontend React ke Backend Laravel (http://localhost:8000/api)
 * Terproteksi dengan Header X-API-KEY.
 */

export const API_BASE_URL = 'http://localhost:8000/api';
export const API_KEY = 'transtv-helpdesk-secret-key-2026';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  // Jangan set Content-Type jika body berupa FormData agar browser mengatur multipart boundary secara otomatis
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');
  headers.set('X-API-KEY', API_KEY);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const helpdeskApi = {
  // 1. Auth: Login dengan NIK dan Password
  login: async (nik: string, password: string) => {
    return request<ApiResponse<{ user: any; api_key: string }>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ nik, password }),
    });
  },

  // 2. Dashboard: Mengambil Statistik Metrik, Line Chart, dan Pie Chart Departemen
  getDashboardStats: async (nik?: string) => {
    const query = nik ? `?nik=${encodeURIComponent(nik)}` : '';
    return request<ApiResponse<{
      metrics: {
        total: number;
        open: number;
        in_progress: number;
        return: number;
        solved: number;
      };
      latest_tickets: any[];
      chart_trend: {
        labels: string[];
        incoming: number[];
        resolved: number[];
      };
      department_distribution: {
        name: string;
        count: number;
        percentage: number;
        color: string;
      }[];
    }>>(`/dashboard/stats${query}`);
  },

  // 3. Tiket: Mengambil daftar tiket dengan filter & pencarian
  getTickets: async (params?: { nik?: string; status?: string; search?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.nik) searchParams.append('nik', params.nik);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const qs = searchParams.toString();
    return request<ApiResponse<any[]>>(`/tickets${qs ? `?${qs}` : ''}`);
  },

  // 4. Tiket: Mengambil detail satu tiket beserta riwayat tanggapan & lampiran
  getTicketDetail: async (noTiket: string) => {
    return request<ApiResponse<any>>(`/tickets/${encodeURIComponent(noTiket)}`);
  },

  // 5. Tiket: Membuat tiket baru (Mendukung upload lampiran File ke tbl_attachment)
  createTicket: async (ticketData: {
    subject: string;
    description: string;
    nik: string;
    id_group?: number;
    tiketkategori_id?: number;
    attachments?: File[];
    dataform?: {
      disetujui?: string;
      pembuatan?: string;
      tipe_program?: string;
      tools_pemrograman?: string;
      jaringan?: string;
      koneksi?: string;
      group_name?: string;
      user_note?: string;
    };
  }) => {
    // Jika ada lampiran berkas fisik, kirim menggunakan FormData multipart
    if (ticketData.attachments && ticketData.attachments.length > 0) {
      const formData = new FormData();
      formData.append('subject', ticketData.subject);
      formData.append('description', ticketData.description);
      formData.append('nik', ticketData.nik);
      if (ticketData.id_group) {
        formData.append('id_group', String(ticketData.id_group));
      }
      if (ticketData.tiketkategori_id) {
        formData.append('tiketkategori_id', String(ticketData.tiketkategori_id));
      }
      if (ticketData.dataform) {
        formData.append('dataform', JSON.stringify(ticketData.dataform));
      }
      ticketData.attachments.forEach((file) => {
        formData.append('attachments[]', file);
      });

      return request<ApiResponse<any>>('/tickets', {
        method: 'POST',
        body: formData,
      });
    }

    return request<ApiResponse<any>>('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  },

  // 5b. Upload lampiran tambahan ke tiket yang sudah ada
  uploadAttachment: async (noTiket: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<ApiResponse<any>>(`/tickets/${encodeURIComponent(noTiket)}/attachments`, {
      method: 'POST',
      body: formData,
    });
  },

  // 6. Tiket: Menambahkan tanggapan/chat dan memperbarui status
  addResponse: async (noTiket: string, responseData: {
    message: string;
    author_nik: string;
    status?: string;
    handler_nik?: string;
  }) => {
    return request<ApiResponse<any>>(`/tickets/${encodeURIComponent(noTiket)}/responses`, {
      method: 'POST',
      body: JSON.stringify(responseData),
    });
  },

  // 7. Master Kategori: Mengambil seluruh kategori & groups
  getCategories: async () => {
    return request<ApiResponse<{
      categories: any[];
      groups: any[];
      ticket_forms?: any[];
    }>>('/categories');
  },

  // 7b. Master Kategori: Membuat Kategori Baru
  createCategory: async (data: { name: string; group_id: number; is_visible?: boolean | number }) => {
    return request<ApiResponse<any>>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 8. Master Kategori: Update Kategori (misal toggle Hide / Unhide)
  updateCategory: async (id: string, data: { name?: string; group_id?: number; is_visible?: boolean | number }) => {
    return request<ApiResponse<any>>(`/categories/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 8b. Master Kategori: Menghapus Kategori
  deleteCategory: async (id: string) => {
    return request<ApiResponse<any>>(`/categories/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  // 9. Laporan: Mengambil laporan tiket riwayat database dengan filter
  getReports: async (params?: { group?: string; year?: string; month?: string; search?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.group && params.group !== 'All Group') searchParams.append('group', params.group);
    if (params?.year && params.year !== 'Years') searchParams.append('year', params.year);
    if (params?.month && params.month !== 'Month') searchParams.append('month', params.month);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const qs = searchParams.toString();
    return request<ApiResponse<any[]>>(`/reports${qs ? `?${qs}` : ''}`);
  },
};

