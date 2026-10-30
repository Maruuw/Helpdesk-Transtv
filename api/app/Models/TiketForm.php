<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TiketForm extends Model
{
    protected $table = 'tbl_tiketform';
    protected $primaryKey = 'id_kategori';
    public $timestamps = false;

    protected $fillable = [
        'id_kategori',
        'nama_tiket',
    ];
}

