<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StatusTiket extends Model
{
    protected $table = 'status_tiket';
    protected $primaryKey = 'statustiket_id';
    public $timestamps = false;

    protected $fillable = [
        'statustiket_id',
        'statustiket_name',
    ];
}

