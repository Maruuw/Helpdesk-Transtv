export interface TicketResponseItem {
  id: string;
  responder: string;
  role: string;
  submitted: string;
  status?: 'Solved' | 'In progress' | 'Return' | 'Reject';
  message: string;
}

export interface TicketRequestItem {
  id: string;
  no: number;
  subject: string;
  description?: string;
  category: string;
  subcategory: string;
  submitted: string;
  status: 'Solved' | 'In progress' | 'Waiting' | 'Return' | 'Pending' | 'Open' | 'Reject';
  handler?: string;
  requester?: string;
  nik?: string;
  department?: string;
  attachments?: { id: string; name: string; size: string }[];
  responses?: TicketResponseItem[];
}

export const initialLatestRequests: TicketRequestItem[] = [
  {
    id: 'REQ-2026-001',
    no: 1,
    subject: 'test 123',
    description: 'Mohon bantuan untuk perubahan data master karyawan pada sistem Insesys karena terdapat salah input penempatan divisi.',
    category: 'Aplikasi Insesys (Umum)',
    subcategory: 'Perubahan Data',
    submitted: '21 Jan 2026, 18:46',
    status: 'Solved',
    handler: 'Raden Azhar Fadhlur Rohman',
    requester: 'Damar Pratama',
    nik: '231270322',
    department: 'Software Development',
    attachments: [
      { id: 'att-1', name: 'sk_mutasi_divisi.pdf', size: '1.2 MB' },
      { id: 'att-2', name: 'screenshot_insesys_error.png', size: '480 KB' },
    ],
    responses: [
      {
        id: 'resp-1',
        responder: 'Raden Azhar Fadhlur Rohman',
        role: 'IT Support',
        submitted: '21 Jan 2026, 19:10',
        status: 'In progress',
        message: 'Tiket telah diterima. Sedang melakukan sinkronisasi data master karyawan pada database Insesys.',
      },
      {
        id: 'resp-2',
        responder: 'Raden Azhar Fadhlur Rohman',
        role: 'IT Support',
        submitted: '21 Jan 2026, 19:45',
        status: 'Solved',
        message: 'Perubahan data telah berhasil diupdate pada sistem Insesys pusat. Silakan cek kembali dan login ulang.',
      },
    ],
  },
  {
    id: 'REQ-2026-002',
    no: 2,
    subject: 'Permintaan Akses VPN Kerja Remote & Server DB',
    description: 'Memerlukan izin remote VPN Cisco dan firewall whitelist untuk deployment database reporting.',
    category: 'Network & Security',
    subcategory: 'Akses VPN & Firewall',
    submitted: '25 Jan 2026, 10:15',
    status: 'In progress',
    handler: 'Raden Azhar (IT Infrastructure)',
    requester: 'Damar Pratama',
    nik: '231270322',
    department: 'Software Development',
    attachments: [{ id: 'att-2', name: 'form_approval_vpn.pdf', size: '520 KB' }],
  },
  {
    id: 'REQ-2026-003',
    no: 3,
    subject: 'Kendala Koneksi Printer Studio 1 News Lantai 3',
    description: 'Printer Canon iR-ADV di meja produser Studio 1 offline dan tidak merespon print cue dari PC kontrol.',
    category: 'Hardware & Perangkat',
    subcategory: 'Printer / Scanner',
    submitted: '26 Jan 2026, 14:30',
    status: 'In progress',
    handler: 'Raden Azhar',
    requester: 'Damar Pratama',
    nik: '231270322',
    department: 'Software Development',
  },
  {
    id: 'REQ-2026-004',
    no: 4,
    subject: 'Reset Password Akun TransHub & Email Korporat',
    description: 'Akun TransHub terkunci setelah salah memasukkan OTP 3 kali. Mohon bantuan reset password.',
    category: 'Akun & Akses',
    subcategory: 'User Management',
    submitted: '27 Jan 2026, 08:20',
    status: 'Return',
    handler: 'Awaiting IT Assignment',
    requester: 'Damar Pratama',
    nik: '231270322',
    department: 'Software Development',
  },
  {
    id: 'REQ-2026-005',
    no: 5,
    subject: 'Lisensi Software Adobe Premiere Pro Video Editor',
    description: 'Pengajuan lisensi Adobe Creative Cloud Premiere Pro 2026 untuk unit video editing pasca produksi.',
    category: 'Software License',
    subcategory: 'Software Request',
    submitted: '27 Jan 2026, 09:45',
    status: 'Solved',
    handler: 'Raden Azhar',
    requester: 'Damar Pratama',
    nik: '231270322',
    department: 'Software Development',
  },
];

