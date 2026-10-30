<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    protected $table = 'tbl_group';
    protected $primaryKey = 'group_id';
    public $timestamps = false;

    protected $fillable = [
        'group_id',
        'nama_group',
        'dept_id',
        'is_visible',
    ];

    public function categories()
    {
        return $this->hasMany(TiketKategori::class, 'group_id', 'group_id');
    }
}

