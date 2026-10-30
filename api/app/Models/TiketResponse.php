<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TiketResponse extends Model
{
    protected $table = 'tiket_response';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'response_message',
        'response_date',
        'no_ticket',
        'response_author',
    ];

    protected $casts = [
        'response_date' => 'datetime',
    ];

    public function ticket()
    {
        return $this->belongsTo(Tiket::class, 'no_ticket', 'no_tiket');
    }

    public function author()
    {
        return $this->belongsTo(Admin::class, 'response_author', 'nik');
    }
}

