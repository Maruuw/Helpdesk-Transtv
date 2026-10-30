<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TiketKategori extends Model
{
    protected $table = 'tbl_tiketkategori';
    protected $primaryKey = 'tiketkategori_id';
    public $timestamps = false;

    protected $fillable = [
        'tiketkategori_id',
        'tiketkategori_nama',
        'id_dept',
        'group_id',
        'is_visible',
    ];

    protected $casts = [
        'group_id' => 'integer',
        'is_visible' => 'integer',
    ];

    public function group()
    {
        return $this->belongsTo(Group::class, 'group_id', 'group_id');
    }

    public function tickets()
    {
        return $this->hasMany(Tiket::class, 'tiketkategori_id', 'tiketkategori_id');
    }
}

