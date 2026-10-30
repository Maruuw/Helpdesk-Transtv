<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tiket;
use App\Models\TiketResponse;
use App\Models\Admin;
use App\Models\TiketKategori;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class TicketController extends Controller
{
    /**
     * Map database numeric status ID to readable status string.
     */
    private function mapStatusName(?int $statusId): string
    {
        return match ($statusId) {
            1 => 'Open',
            2 => 'Solved',
            3 => 'Return',
            4 => 'In progress',
            5 => 'Reject',
            default => 'Open',
        };
    }

    /**
     * Map readable status string back to database numeric status ID.
     */
    private function mapStatusId(string $statusName): int
    {
        return match (strtolower(trim($statusName))) {
            'open' => 1,
            'solved' => 2,
            'return' => 3,
            'in progress', 'in_progress', 'on process', 'on_process' => 4,
            'reject', 'rejected' => 5,
            default => 1,
        };
    }

    /**
     * GET /api/tickets
     * Ambil daftar tiket (bisa difilter NIK pemohon, status, pencarian, dan limit).
     */
    public function index(Request $request)
    {
        $query = Tiket::with(['status', 'kategori.group', 'handler', 'requester', 'attachments', 'responses'])
            ->orderBy('tiket_createdate', 'desc');

        // Filter berdasarkan NIK pemohon (untuk User biasa)
        if ($request->filled('nik')) {
            $query->where('tiket_createby', $request->query('nik'));
        }

        // Filter berdasarkan Status
        if ($request->filled('status') && strtolower($request->query('status')) !== 'all') {
            $statusId = $this->mapStatusId($request->query('status'));
            $query->where('tiket_statusid', $statusId);
        }

        // Pencarian (Search by subject atau problem)
        if ($request->filled('search')) {
            $search = '%' . $request->query('search') . '%';
            $query->where(function ($q) use ($search) {
                $q->where('tiket_subject', 'like', $search)
                  ->orWhere('tiket_problem', 'like', $search)
                  ->orWhere('no_tiket', 'like', $search);
            });
        }

        $limit = $request->query('limit', 50);
        $tickets = $query->paginate($limit);

        // Format output agar cocok 100% dengan frontend React
        $formatted = $tickets->map(function ($t, $index) use ($tickets) {
            $categoryName = $t->kategori->tiketkategori_nama ?? 'Umum';
            $groupName = $t->kategori->group->nama_group ?? 'IT Support';

            return [
                'id' => $t->no_tiket,
                'no' => $tickets->firstItem() + $index,
                'subject' => $t->tiket_subject,
                'description' => strip_tags(str_replace(['<br>', '<br />', '<br/>'], "\n", $t->tiket_problem)),
                'category' => $groupName,
                'subcategory' => $categoryName,
                'submitted' => Carbon::parse($t->tiket_createdate)->locale('id')->translatedFormat('d M Y, H:i'),
                'raw_date' => $t->tiket_createdate,
                'status' => $this->mapStatusName($t->tiket_statusid),
                'handler' => $t->handler->nama_karyawan ?? null,
                'handler_nik' => $t->tiket_handleby,
                'requester' => $t->requester->nama_karyawan ?? ('Karyawan (' . $t->tiket_createby . ')'),
                'nik' => $t->tiket_createby,
                'attachments_count' => $t->attachments->count(),
                'responses_count' => $t->responses->count(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formatted,
            'pagination' => [
                'total' => $tickets->total(),
                'current_page' => $tickets->currentPage(),
                'last_page' => $tickets->lastPage(),
                'per_page' => $tickets->perPage(),
            ],
        ]);
    }

    /**
     * GET /api/tickets/{no_tiket}
     * Ambil detail tiket lengkap beserta riwayat percakapan/tanggapan dan lampiran.
     */
    public function show($no_tiket)
    {
        $ticket = Tiket::with(['status', 'kategori.group', 'handler', 'requester', 'attachments', 'responses.author'])
            ->where('no_tiket', $no_tiket)
            ->first();

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Tiket tidak ditemukan',
            ], 404);
        }

        $categoryName = $ticket->kategori->tiketkategori_nama ?? 'Umum';
        $groupName = $ticket->kategori->group->nama_group ?? 'IT Support';

        // Format responses list
        $responses = $ticket->responses->map(function ($resp) {
            return [
                'id' => (string) $resp->id,
                'responder' => $resp->author->nama_karyawan ?? ('Staff (' . $resp->response_author . ')'),
                'role' => $resp->author ? 'IT Support' : 'User',
                'submitted' => Carbon::parse($resp->response_date)->locale('id')->translatedFormat('d M Y, H:i'),
                'message' => strip_tags(str_replace(['<br>', '<br />', '<br/>'], "\n", $resp->response_message)),
            ];
        });

        // Format attachments
        $attachments = $ticket->attachments->map(function ($att) {
            return [
                'id' => (string) $att->id_attachment,
                'name' => $att->filename ?? basename($att->path_file ?? 'file'),
                'path' => $att->path_file,
                'size' => 'Dokumen',
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $ticket->no_tiket,
                'subject' => $ticket->tiket_subject,
                'description' => strip_tags(str_replace(['<br>', '<br />', '<br/>'], "\n", $ticket->tiket_problem)),
                'category' => $groupName,
                'subcategory' => $categoryName,
                'submitted' => Carbon::parse($ticket->tiket_createdate)->locale('id')->translatedFormat('d M Y, H:i'),
                'status' => $this->mapStatusName($ticket->tiket_statusid),
                'handler' => $ticket->handler->nama_karyawan ?? null,
                'handler_nik' => $ticket->tiket_handleby,
                'requester' => $ticket->requester->nama_karyawan ?? ('Karyawan (' . $ticket->tiket_createby . ')'),
                'nik' => $ticket->tiket_createby,
                'attachments' => $attachments,
                'responses' => $responses,
            ],
        ]);
    }

    /**
     * POST /api/tickets
     * Buat tiket baru ke database.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'nik' => 'required|string',
            'tiketkategori_id' => 'nullable|integer',
            'id_group' => 'nullable|integer',
        ]);

        // Generate No Tiket unik (timestamp epoch 10 digit standar helpdesk lama)
        $noTiket = (string) time();

        $ticket = Tiket::create([
            'no_tiket' => $noTiket,
            'tiket_subject' => $validated['subject'],
            'tiket_problem' => nl2br(e($validated['description'])),
            'tiket_createdate' => now(),
            'tiket_createby' => $validated['nik'],
            'tiket_statusid' => 1, // 1 = Open
            'id_group' => $validated['id_group'] ?? 1,
            'tiketkategori_id' => $validated['tiketkategori_id'] ?? 1,
        ]);

        // Simpan data spesifikasi teknis form jika ada (tbl_dataform)
        if ($request->filled('dataform')) {
            $df = $request->input('dataform');
            \App\Models\Dataform::create([
                'no_tiket' => $noTiket,
                'disetujui' => $df['disetujui'] ?? 'ya',
                'pembuatan' => $df['pembuatan'] ?? 'Inhouse',
                'tipe_program' => $df['tipe_program'] ?? 'non-multimedia',
                'tools_pemrograman' => $df['tools_pemrograman'] ?? '',
                'jaringan' => $df['jaringan'] ?? 'office',
                'koneksi' => $df['koneksi'] ?? 'Jaringan',
                'group_id' => $validated['id_group'] ?? 1,
                'group_name' => $df['group_name'] ?? '',
                'user_note' => $df['user_note'] ?? '',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Tiket berhasil dibuat',
            'data' => [
                'id' => $ticket->no_tiket,
                'subject' => $ticket->tiket_subject,
                'status' => 'Open',
            ],
        ], 201);
    }

    /**
     * POST /api/tickets/{no_tiket}/responses
     * Tambahkan respon/balasan ke tiket dan perbarui status pengerjaan tiket.
     */
    public function addResponse(Request $request, $no_tiket)
    {
        $ticket = Tiket::where('no_tiket', $no_tiket)->first();
        if (!$ticket) {
            return response()->json(['success' => false, 'message' => 'Tiket tidak ditemukan'], 404);
        }

        $validated = $request->validate([
            'message' => 'required|string',
            'author_nik' => 'required|string',
            'status' => 'nullable|string', // 'In progress', 'Solved', 'Return', 'Reject'
            'handler_nik' => 'nullable|string',
        ]);

        // Simpan pesan respon
        $response = TiketResponse::create([
            'no_ticket' => $no_tiket,
            'response_message' => nl2br(e($validated['message'])),
            'response_date' => now(),
            'response_author' => $validated['author_nik'],
        ]);

        // Update status tiket jika dikirim
        if (!empty($validated['status'])) {
            $ticket->tiket_statusid = $this->mapStatusId($validated['status']);
        }

        // Update handler jika belum ada atau diperbarui
        if (!empty($validated['handler_nik'])) {
            $ticket->tiket_handleby = $validated['handler_nik'];
            $ticket->tiket_handledate = now();
        }

        $ticket->save();

        return response()->json([
            'success' => true,
            'message' => 'Tanggapan berhasil dikirim',
            'data' => [
                'id' => (string) $response->id,
                'message' => $validated['message'],
                'date' => Carbon::parse($response->response_date)->locale('id')->translatedFormat('d M Y, H:i'),
                'ticket_status' => $this->mapStatusName($ticket->tiket_statusid),
            ],
        ]);
    }

    /**
     * GET /api/dashboard/stats
     * Statistik ringkasan Dashboard, Line Chart Tren, dan Donut/Pie Chart Departemen.
     */
    public function dashboardStats(Request $request)
    {
        $query = Tiket::query();
        if ($request->filled('nik')) {
            $query->where('tiket_createby', $request->query('nik'));
        }

        // Metrik Ringkasan Status
        $total = (clone $query)->count();
        $open = (clone $query)->where('tiket_statusid', 1)->count();
        $solved = (clone $query)->where('tiket_statusid', 2)->count();
        $return = (clone $query)->where('tiket_statusid', 3)->count();
        $inProgress = (clone $query)->where('tiket_statusid', 4)->count();
        $reject = (clone $query)->where('tiket_statusid', 5)->count();

        // 5 Tiket Terbaru
        $latest = (clone $query)->with(['status', 'kategori.group', 'handler', 'requester'])
            ->orderBy('tiket_createdate', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($t, $idx) {
                return [
                    'id' => $t->no_tiket,
                    'no' => $idx + 1,
                    'subject' => $t->tiket_subject,
                    'category' => $t->kategori->group->nama_group ?? 'IT Support',
                    'subcategory' => $t->kategori->tiketkategori_nama ?? 'Umum',
                    'submitted' => Carbon::parse($t->tiket_createdate)->locale('id')->translatedFormat('d M Y, H:i'),
                    'status' => $this->mapStatusName($t->tiket_statusid),
                    'handler' => $t->handler->nama_karyawan ?? null,
                ];
            });

        // 1. DATASET LINE CHART (Harian, Bulanan, Tahunan)
        // Hitung 7 hari terakhir (Sen - Min)
        $dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
        $dailyIncoming = [0, 0, 0, 0, 0, 0, 0];
        $dailyResolved = [0, 0, 0, 0, 0, 0, 0];

        $recentTickets = (clone $query)->where('tiket_createdate', '>=', now()->subDays(30))->get();
        foreach ($recentTickets as $t) {
            $dayOfWeek = Carbon::parse($t->tiket_createdate)->dayOfWeekIso; // 1 = Monday ... 7 = Sunday
            $idx = $dayOfWeek - 1;
            if ($idx >= 0 && $idx < 7) {
                $dailyIncoming[$idx]++;
                if ($t->tiket_statusid === 2) {
                    $dailyResolved[$idx]++;
                }
            }
        }

        // 2. DATASET PIE / DONUT CHART (Distribusi Departemen / Unit yang sering request)
        // Dikelompokkan berdasarkan group IT atau kategori pelapor
        $departmentDistribution = DB::table('tiket')
            ->leftJoin('tbl_group', 'tiket.id_group', '=', 'tbl_group.group_id')
            ->select(
                DB::raw("COALESCE(tbl_group.nama_group, 'IT Support / Umum') as department_name"),
                DB::raw('count(*) as total_tickets')
            )
            ->groupBy('department_name')
            ->orderBy('total_tickets', 'desc')
            ->limit(6)
            ->get();

        $pieColors = ['#0C3E7E', '#2563EB', '#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6'];
        $pieData = $departmentDistribution->map(function ($item, $idx) use ($total, $pieColors) {
            $percentage = $total > 0 ? round(($item->total_tickets / $total) * 100, 1) : 0;
            return [
                'name' => $item->department_name,
                'count' => $item->total_tickets,
                'percentage' => $percentage,
                'color' => $pieColors[$idx % count($pieColors)],
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'metrics' => [
                    'total' => $total,
                    'open' => $open,
                    'in_progress' => $inProgress,
                    'return' => $return,
                    'solved' => $solved,
                    'reject' => $reject,
                ],
                'latest_tickets' => $latest,
                'chart_trend' => [
                    'labels' => $dayLabels,
                    'incoming' => $dailyIncoming,
                    'resolved' => $dailyResolved,
                ],
                'department_distribution' => $pieData,
            ],
        ]);
    }

    /**
     * GET /api/reports
     * Laporan seluruh tiket historis dan berjalan dari database db_helpdesk.
     */
    public function report(Request $request)
    {
        $query = Tiket::with(['status', 'kategori.group', 'handler', 'requester', 'responses']);

        if ($request->filled('group') && $request->query('group') !== 'All Group') {
            $groupName = $request->query('group');
            $query->where(function($q) use ($groupName) {
                $q->whereHas('kategori.group', function ($sub) use ($groupName) {
                    $sub->where('nama_group', $groupName);
                });
            });
        }

        if ($request->filled('year') && $request->query('year') !== 'Years') {
            $query->whereYear('tiket_createdate', $request->query('year'));
        }

        if ($request->filled('month') && $request->query('month') !== 'Month') {
            $months = [
                'januari' => 1, 'februari' => 2, 'maret' => 3, 'april' => 4,
                'mei' => 5, 'juni' => 6, 'juli' => 7, 'agustus' => 8,
                'september' => 9, 'oktober' => 10, 'november' => 11, 'desember' => 12,
            ];
            $m = strtolower(trim($request->query('month')));
            if (isset($months[$m])) {
                $query->whereMonth('tiket_createdate', $months[$m]);
            }
        }

        if ($request->filled('search')) {
            $search = '%' . $request->query('search') . '%';
            $query->where(function ($q) use ($search) {
                $q->where('tiket_subject', 'like', $search)
                  ->orWhere('tiket_problem', 'like', $search)
                  ->orWhere('no_tiket', 'like', $search);
            });
        }

        $limit = $request->query('limit', 500);
        $tickets = $query->orderBy('tiket_createdate', 'desc')->take($limit)->get();

        $monthNames = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];

        $reportData = $tickets->map(function ($t) use ($monthNames) {
            $cat = $t->kategori;
            $groupName = $cat->group->nama_group ?? 'IT Support';
            $catName = $cat->tiketkategori_nama ?? 'Umum';
            $created = Carbon::parse($t->tiket_createdate);
            $lastResp = $t->responses->last();
            $solution = $lastResp 
                ? strip_tags(str_replace(['<br>', '<br />', '<br/>'], "\n", $lastResp->response_message)) 
                : (strip_tags(str_replace(['<br>', '<br />', '<br/>'], "\n", $t->tiket_problem)) ?: 'Pekerjaan selesai.');

            $handlerName = $t->handler->nama_karyawan ?? ($t->tiket_handleby ? ('Staff IT (' . $t->tiket_handleby . ')') : 'IT Support Team');
            $initials = collect(explode(' ', $handlerName))->map(fn($w) => strtoupper($w[0] ?? ''))->take(2)->join('');

            return [
                'id' => (string) $t->no_tiket,
                'ticketSubject' => $t->tiket_subject,
                'ticketSubtitle' => $catName,
                'requesterName' => $t->requester->nama_karyawan ?? ('Karyawan (' . $t->tiket_createby . ')'),
                'requesterDept' => 'TRANS TV',
                'group' => $groupName,
                'handledByName' => $handlerName,
                'handledByInitials' => $initials ?: 'IT',
                'handledByColor' => 'bg-[#DBEAFE] text-[#1D4ED8]',
                'solution' => $solution,
                'categoryDetail' => $catName,
                'handledOn' => $t->tiket_handledate ? Carbon::parse($t->tiket_handledate)->locale('id')->translatedFormat('d M Y, H:i') : $created->locale('id')->translatedFormat('d M Y, H:i'),
                'year' => (int) $created->format('Y'),
                'month' => $monthNames[(int) $created->format('n')] ?? $created->format('F'),
                'status' => $t->status->statustiket_name ?? 'Open',
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $reportData,
        ]);
    }
}
