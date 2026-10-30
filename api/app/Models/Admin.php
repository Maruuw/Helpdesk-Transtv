<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Admin extends Model
{
    protected $table = 'admin';
    protected $primaryKey = 'nik';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'nik',
        'nama_karyawan',
        'is_active',
        'user_joindate',
        'level_id',
    ];

    protected $casts = [
        'user_joindate' => 'datetime',
        'level_id' => 'integer',
    ];

    public function ticketsHandled()
    {
        return $this->hasMany(Tiket::class, 'tiket_handleby', 'nik');
    }

    public function ticketsCreated()
    {
        return $this->hasMany(Tiket::class, 'tiket_createby', 'nik');
    }
}

