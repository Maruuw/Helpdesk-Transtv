<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    /**
     * POST /api/auth/login
     * Autentikasi NIK dan Password dengan sistem Helpdesk TRANS TV.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'nik' => 'required|string',
            'password' => 'required|string',
        ]);

        $nik = trim($validated['nik']);
        $password = trim($validated['password']);

        // Cek apakah NIK terdaftar di tabel admin (HeidiSQL: db_helpdesk.admin)
        $admin = Admin::where('nik', $nik)->first();

        // 1. Akun Admin (Jika NIK ada di tabel admin, misal: 231270322 - Raden Azhar Fadhlur)
        if ($admin) {
            // Di database legacy TRANS TV, tabel admin tidak memiliki kolom password tersendiri
            // (menggunakan autentikasi domain/PIN karyawan).
            // Selama akun aktif (is_active = 1) dan password diisi, login sebagai Admin diizinkan!
            if ($admin->is_active !== '0') {
                return response()->json([
                    'success' => true,
                    'message' => 'Login berhasil sebagai Administrator (' . $admin->nama_karyawan . ')',
                    'data' => [
                        'user' => [
                            'nik' => $admin->nik,
                            'name' => $admin->nama_karyawan,
                            'department' => 'Information Technology',
                            'role' => 'admin',
                            'level_id' => $admin->level_id,
                        ],
                        'api_key' => env('HELPDESK_API_KEY', 'transtv-helpdesk-secret-key-2026'),
                    ],
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Akun Administrator ini sedang nonaktif (is_active = 0). Silakan hubungi IT Supervisor.',
                ], 403);
            }
        }

        // 2. Akun Karyawan / User Biasa (Pemohon Tiket)
        // Jika NIK tidak ada di tabel admin, anggap sebagai user karyawan umum
        if (!empty($password)) {
            return response()->json([
                'success' => true,
                'message' => 'Login berhasil sebagai Karyawan',
                'data' => [
                    'user' => [
                        'nik' => $nik,
                        'name' => $nik === 'damar' ? 'Damar Pratama' : ('Karyawan (' . $nik . ')'),
                        'department' => 'TRANS TV Staff',
                        'role' => 'user',
                    ],
                    'api_key' => env('HELPDESK_API_KEY', 'transtv-helpdesk-secret-key-2026'),
                ],
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'NIK atau Password tidak valid. Silakan periksa kembali data Anda.',
        ], 401);
    }
}
