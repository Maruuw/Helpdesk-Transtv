<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dataform extends Model
{
    protected $table = 'tbl_dataform';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'disetujui',
        'pembuatan',
        'tipe_program',
        'tools_pemrograman',
        'jaringan',
        'koneksi',
        'no_tiket',
        'group_id',
        'group_name',
        'user_note',
    ];

    public function ticket()
    {
        return $this->belongsTo(Tiket::class, 'no_tiket', 'no_tiket');
    }
}

