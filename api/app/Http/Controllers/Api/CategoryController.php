<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TiketKategori;
use App\Models\Group;
use App\Models\TiketForm;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * GET /api/categories
     * Ambil daftar seluruh kategori dan group penanganan IT dari tbl_tiketkategori & tbl_group & tbl_tiketform.
     */
    public function index()
    {
        $formCategoryIds = TiketForm::pluck('id_kategori')->toArray();

        $categories = TiketKategori::with('group')
            ->orderBy('group_id', 'asc')
            ->orderBy('tiketkategori_id', 'asc')
            ->get()
            ->map(function ($cat) use ($formCategoryIds) {
                return [
                    'id' => (string) $cat->tiketkategori_id,
                    'name' => $cat->tiketkategori_nama,
                    'group_id' => $cat->group_id,
                    'group_name' => $cat->group->nama_group ?? 'General IT',
                    'is_visible' => (bool) $cat->is_visible,
                    'is_form' => in_array((int) $cat->tiketkategori_id, $formCategoryIds),
                    'tickets_count' => $cat->tickets()->count(),
                ];
            });

        $groups = Group::all()->map(function ($grp) {
            return [
                'id' => $grp->group_id,
                'name' => $grp->nama_group,
                'dept_id' => $grp->dept_id,
            ];
        });

        $ticketForms = TiketForm::all()->map(function ($tf) {
            return [
                'id_kategori' => $tf->id_kategori,
                'nama_tiket' => $tf->nama_tiket,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'categories' => $categories,
                'groups' => $groups,
                'ticket_forms' => $ticketForms,
            ],
        ]);
    }

    /**
     * POST /api/categories
     * Tambah kategori baru ke database.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'group_id' => 'required|integer',
            'is_visible' => 'nullable|boolean',
        ]);

        $category = TiketKategori::create([
            'tiketkategori_nama' => $validated['name'],
            'group_id' => $validated['group_id'],
            'is_visible' => $validated['is_visible'] ?? 0,
            'id_dept' => 'DBA',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil ditambahkan',
            'data' => [
                'id' => (string) $category->tiketkategori_id,
                'name' => $category->tiketkategori_nama,
            ],
        ], 201);
    }

    /**
     * PUT /api/categories/{id}
     * Update kategori.
     */
    public function update(Request $request, $id)
    {
        $category = TiketKategori::find($id);
        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Kategori tidak ditemukan'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:150',
            'group_id' => 'sometimes|required|integer',
            'is_visible' => 'sometimes|boolean',
        ]);

        if (isset($validated['name'])) $category->tiketkategori_nama = $validated['name'];
        if (isset($validated['group_id'])) $category->group_id = $validated['group_id'];
        if (isset($validated['is_visible'])) $category->is_visible = $validated['is_visible'] ? 1 : 0;

        $category->save();

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil diperbarui',
            'data' => [
                'id' => (string) $category->tiketkategori_id,
                'name' => $category->tiketkategori_nama,
            ],
        ]);
    }

    /**
     * DELETE /api/categories/{id}
     * Hapus kategori.
     */
    public function destroy($id)
    {
        $category = TiketKategori::find($id);
        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Kategori tidak ditemukan'], 404);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil dihapus',
        ]);
    }
}
