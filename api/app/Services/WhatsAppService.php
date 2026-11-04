<?php

namespace App\Services;

use App\Models\Tiket;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected string $portalUrl;
    protected string $provider;
    protected string $token;
    protected string $phoneNumberId;
    protected string $gatewayUrl;

    public function __construct()
    {
        $this->portalUrl = rtrim(config('services.whatsapp.portal_url', 'http://localhost:5173'), '/');
        $this->provider = config('services.whatsapp.provider', 'meta');
        $this->token = config('services.whatsapp.token', '');
        $this->phoneNumberId = config('services.whatsapp.phone_number_id', '');
        $this->gatewayUrl = config('services.whatsapp.gateway_url', '');
    }

    /**
     * Mendapatkan Base URL Portal Web Helpdesk
     */
    public function getPortalUrl(): string
    {
        return $this->portalUrl;
    }

    /**
     * Helper untuk memetakan nama status tiket
     */
    protected function mapStatusName(?int $statusId): string
    {
        return match ($statusId) {
            1 => 'Open',
            2 => 'Solved',
            3 => 'Return (Revisi)',
            4 => 'In progress',
            5 => 'Rejected',
            default => 'Open',
        };
    }

    /**
     * Menu Pembuka / Greeting Interaktif
     */
    public function buildGreetingPayload(string $recipientPhone): array
    {
        $message = "📺 *TRANS TV IT HELPDESK SUPPORT*\n\n"
            . "Halo Rekan TRANS TV, terima kasih telah menghubungi Pusat Dukungan Teknis IT.\n\n"
            . "⚠️ *Pemberitahuan Layanan*:\n"
            . "Demi efisiensi, kecepatan penanganan, dan kepastian nomor antrean, pelaporan kendala teknis *dialihkan sepenuhnya melalui Web Helpdesk Resmi TRANS TV*. Percakapan teks bebas di nomor ini tidak dipantau secara langsung oleh teknisi.\n\n"
            . "Silakan pilih layanan yang Anda butuhkan di bawah ini:\n"
            . "1️⃣ *Buat Tiket Baru* (Kendala Hardware, Software, Jaringan, Broadcast)\n"
            . "2️⃣ *Cek Status & Progres Tiket*\n"
            . "3️⃣ *Informasi Jam Layanan & Kontak Darurat*";

        $buttons = [
            ['id' => 'menu_create_ticket', 'title' => '🎫 Buat Tiket Baru'],
            ['id' => 'menu_check_status', 'title' => '🔍 Cek Status Tiket'],
            ['id' => 'menu_info', 'title' => 'ℹ️ Info Layanan IT'],
        ];

        return [
            'type' => 'interactive',
            'action' => 'greeting',
            'recipient' => $recipientPhone,
            'text' => $message,
            'buttons' => $buttons,
        ];
    }

    /**
     * Respon Navigasi ke Form Buat Tiket Baru
     */
    public function buildCreateTicketPayload(string $recipientPhone): array
    {
        $url = $this->portalUrl . '/?action=create-ticket';

        $message = "🎫 *PEMBUATAN TIKET BANTUAN IT*\n\n"
            . "Silakan klik tautan resmi di bawah ini untuk mengisi formulir kendala dan melampirkan foto/screenshot kendala Anda:\n\n"
            . "👉 *{$url}*\n\n"
            . "💡 *Keuntungan Menggunakan Web Portal*:\n"
            . "• Tiket langsung mendapatkan nomor antrean resmi (Epoch ID).\n"
            . "• Notifikasi penugasan instan ke tim teknisi spesialis (Hardware, Broadcast, Software, TOS).\n"
            . "• Transparansi linimasa progres penanganan hingga selesai (Solved).\n\n"
            . "Setelah disubmit, Anda dapat memantau statusnya kapan saja.";

        return [
            'type' => 'redirect',
            'action' => 'create_ticket',
            'recipient' => $recipientPhone,
            'text' => $message,
            'redirect_url' => $url,
            'buttons' => [
                ['id' => 'menu_check_status', 'title' => '🔍 Cek Tiket Lain'],
                ['id' => 'menu_main', 'title' => '🏠 Menu Utama'],
            ],
        ];
    }

    /**
     * Respon Cek Status Tiket (Prompt minta nomor tiket)
     */
    public function buildCheckStatusPromptPayload(string $recipientPhone): array
    {
        $url = $this->portalUrl . '/?action=my-tickets';

        $message = "🔍 *PELACAKAN STATUS TIKET*\n\n"
            . "Ketik langsung *Nomor Tiket* Anda pada chat ini (contoh: *1793351943* atau *REQ-001*),\n"
            . "atau klik tautan berikut untuk melihat seluruh daftar riwayat tiket Anda di portal:\n\n"
            . "👉 *{$url}*";

        return [
            'type' => 'prompt',
            'action' => 'check_status_prompt',
            'recipient' => $recipientPhone,
            'text' => $message,
            'redirect_url' => $url,
            'buttons' => [
                ['id' => 'menu_create_ticket', 'title' => '🎫 Buat Tiket Baru'],
                ['id' => 'menu_main', 'title' => '🏠 Menu Utama'],
            ],
        ];
    }

    /**
     * Respon Hasil Detail Tiket Berdasarkan Nomor Tiket
     */
    public function buildTicketStatusPayload(string $recipientPhone, Tiket $ticket): array
    {
        $categoryName = $ticket->kategori->tiketkategori_nama ?? 'Umum';
        $groupName = $ticket->kategori->group->nama_group ?? 'IT Support';
        $handlerName = $ticket->handler->nama_karyawan ?? 'Belum Ditugaskan';
        $requesterName = $ticket->requester->nama_karyawan ?? ('Karyawan (' . $ticket->tiket_createby . ')');
        $statusName = $this->mapStatusName($ticket->tiket_statusid);
        $date = Carbon::parse($ticket->tiket_createdate)->locale('id')->translatedFormat('d M Y, H:i');

        $url = $this->portalUrl . '/?ticket=' . $ticket->no_tiket;

        $message = "📋 *INFORMASI TIKET #{$ticket->no_tiket}*\n\n"
            . "• *Subjek*: {$ticket->tiket_subject}\n"
            . "• *Group*: {$groupName}\n"
            . "• *Kategori*: {$categoryName}\n"
            . "• *Status*: *{$statusName}*\n"
            . "• *Pemohon*: {$requesterName}\n"
            . "• *Teknisi Bertugas*: {$handlerName}\n"
            . "• *Dibuat Pada*: {$date}\n\n"
            . "👉 *Lihat Riwayat & Detail Lengkap di Web*:\n"
            . "{$url}\n\n"
            . "Ketik *MENU* untuk kembali ke menu utama.";

        return [
            'type' => 'ticket_info',
            'action' => 'ticket_detail',
            'recipient' => $recipientPhone,
            'ticket_id' => $ticket->no_tiket,
            'text' => $message,
            'redirect_url' => $url,
            'buttons' => [
                ['id' => 'menu_create_ticket', 'title' => '🎫 Buat Tiket Baru'],
                ['id' => 'menu_main', 'title' => '🏠 Menu Utama'],
            ],
        ];
    }

    /**
     * Respon Informasi Layanan & Kontak Darurat IT
     */
    public function buildInfoPayload(string $recipientPhone): array
    {
        $message = "ℹ️ *INFORMASI LAYANAN IT HELPDESK TRANS TV*\n\n"
            . "⏰ *Waktu Layanan*:\n"
            . "• Portal Web Helpdesk: 24 Jam / 7 Hari (Online)\n"
            . "• Jam Kerja Kantor: Senin - Jumat (08:30 - 17:30 WIB)\n"
            . "• Tim On-Duty Shift: 24/7 (Khusus Siaran / Master Control / Studio)\n\n"
            . "📍 *Lokasi IT Desk*:\n"
            . "Gedung TRANS TV Lt. 2 - Ruang IT & Broadcast Engineering\n\n"
            . "📞 *Kontak Darurat Studio (Khusus On-Air Emergency)*:\n"
            . "• Ext. Master Control: 2100 / 2105\n"
            . "• Ruang Server: Ext. 2110\n\n"
            . "👉 Akses portal resmi untuk pengajuan kendala non-darurat:\n"
            . $this->portalUrl . '/?action=create-ticket';

        return [
            'type' => 'info',
            'action' => 'info_display',
            'recipient' => $recipientPhone,
            'text' => $message,
            'buttons' => [
                ['id' => 'menu_create_ticket', 'title' => '🎫 Buat Tiket Baru'],
                ['id' => 'menu_main', 'title' => '🏠 Menu Utama'],
            ],
        ];
    }

    /**
     * Respon Defleksi Chat Bebas (Anti-Free-Chat)
     * Digunakan ketika user mengirim chat teks sembarangan tanpa struktur.
     */
    public function buildDeflectionPayload(string $recipientPhone, string $rawMessage = ''): array
    {
        $createUrl = $this->portalUrl . '/?action=create-ticket';
        $trackUrl = $this->portalUrl . '/?action=my-tickets';

        $message = "🤖 *PEMBERITAHUAN OTOMATIS IT SUPPORT*\n\n"
            . "Mohon maaf, pesan teks bebas di WhatsApp *tidak dipantau secara langsung oleh teknisi*.\n\n"
            . "Agar kendala Anda segera terdata, mendapatkan nomor antrean resmi, dan ditugaskan ke teknisi, silakan laporkan kendala Anda melalui portal Web Helpdesk:\n\n"
            . "👉 *Buat Tiket*: {$createUrl}\n"
            . "👉 *Cek Tiket Saya*: {$trackUrl}\n\n"
            . "Ketik *MENU* atau *1* untuk membuka pilihan layanan kembali.";

        return [
            'type' => 'deflection',
            'action' => 'deflect_free_text',
            'recipient' => $recipientPhone,
            'received_text' => $rawMessage,
            'text' => $message,
            'buttons' => [
                ['id' => 'menu_create_ticket', 'title' => '🎫 Buat Tiket Baru'],
                ['id' => 'menu_main', 'title' => '🏠 Menu Utama'],
            ],
        ];
    }

    /**
     * Memproses Pesan Masuk dan Menentukan Respon Bot
     */
    public function processIncomingMessage(string $fromPhone, string $messageText = '', ?string $buttonId = null): array
    {
        $cleanText = strtolower(trim($messageText));
        $btn = $buttonId ? strtolower(trim($buttonId)) : null;

        // 1. Tombol atau Perintah Buat Tiket
        if (
            $btn === 'menu_create_ticket' ||
            in_array($cleanText, ['1', 'buat tiket', 'buat', 'bikin tiket', 'tiket baru', 'lapor', 'laporkan', 'create'])
        ) {
            return $this->buildCreateTicketPayload($fromPhone);
        }

        // 2. Tombol atau Perintah Cek Status
        if (
            $btn === 'menu_check_status' ||
            in_array($cleanText, ['2', 'cek status', 'cek tiket', 'status', 'progress', 'lacak', 'my ticket', 'track'])
        ) {
            return $this->buildCheckStatusPromptPayload($fromPhone);
        }

        // 3. Tombol atau Perintah Info Layanan
        if (
            $btn === 'menu_info' ||
            in_array($cleanText, ['3', 'info', 'bantuan', 'help', 'sop', 'jam kerja', 'kontak', 'darurat'])
        ) {
            return $this->buildInfoPayload($fromPhone);
        }

        // 4. Tombol Menu Utama atau Salam Pembuka
        if (
            $btn === 'menu_main' ||
            in_array($cleanText, ['menu', 'halo', 'hi', 'hai', 'p', 'start', 'mulai', 'pagi', 'siang', 'sore', 'malam', 'tes', 'test', 'helpdesk'])
        ) {
            return $this->buildGreetingPayload($fromPhone);
        }

        // 5. Cek apakah pengguna mengetik Nomor Tiket (Angka digit panjang atau diawali REQ)
        $potentialTicketNo = preg_replace('/[^0-9]/', '', $cleanText);
        if (strlen($potentialTicketNo) >= 6) {
            $ticket = Tiket::with(['kategori.group', 'handler', 'requester'])
                ->where('no_tiket', $potentialTicketNo)
                ->first();

            if ($ticket) {
                return $this->buildTicketStatusPayload($fromPhone, $ticket);
            }
        }

        // 6. Jika pengguna mengirimkan teks bebas apapun lainnya -> DEFLEKSI KE WEB
        return $this->buildDeflectionPayload($fromPhone, $messageText);
    }

    /**
     * Mengirim Pesan Balasan Nyata ke WhatsApp API (Meta Cloud API / Gateway)
     */
    public function sendMessage(array $payload): array
    {
        $recipient = $payload['recipient'];
        $text = $payload['text'];

        // Jika token API belum diisi di .env, sistem bekerja dalam mode simulasi / log
        if (empty($this->token)) {
            Log::info("WhatsApp Gateway [Simulated Send to {$recipient}]:\n" . $text);
            return [
                'status' => 'simulated',
                'message' => 'Pesan dicatat dalam mode simulasi (token belum dikonfigurasi).',
                'payload' => $payload,
            ];
        }

        try {
            // Mode Meta WhatsApp Cloud API Resmi
            if ($this->provider === 'meta') {
                $url = "https://graph.facebook.com/v19.0/{$this->phoneNumberId}/messages";
                $response = Http::withToken($this->token)->post($url, [
                    'messaging_product' => 'whatsapp',
                    'recipient_type' => 'individual',
                    'to' => $recipient,
                    'type' => 'text',
                    'text' => [
                        'preview_url' => true,
                        'body' => $text,
                    ],
                ]);

                return [
                    'status' => $response->successful() ? 'sent' : 'failed',
                    'status_code' => $response->status(),
                    'response' => $response->json(),
                ];
            }

            // Mode Gateway Pihak Ketiga (Fonnte, Wablas, dll.)
            if (!empty($this->gatewayUrl)) {
                $response = Http::withHeaders([
                    'Authorization' => $this->token,
                ])->post($this->gatewayUrl, [
                    'target' => $recipient,
                    'message' => $text,
                ]);

                return [
                    'status' => $response->successful() ? 'sent' : 'failed',
                    'response' => $response->json(),
                ];
            }

            return [
                'status' => 'unsupported_provider',
                'message' => 'Provider WhatsApp tidak dikenali.',
            ];
        } catch (\Throwable $e) {
            Log::error('Gagal mengirim WhatsApp message: ' . $e->getMessage());
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
        }
    }
}

