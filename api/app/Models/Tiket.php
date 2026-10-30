<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tiket extends Model
{
    protected $table = 'tiket';
    protected $primaryKey = 'no_tiket';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'no_tiket',
        'tiket_subject',
        'tiket_problem',
        'tiket_createdate',
        'tiket_createby',
        'tiket_handledate',
        'tiket_handleby',
        'tiket_statusid',
        'id_group',
        'tiketkategori_id',
    ];

    protected $casts = [
        'tiket_createdate' => 'datetime',
        'tiket_handledate' => 'datetime',
        'tiket_statusid' => 'integer',
        'id_group' => 'integer',
        'tiketkategori_id' => 'integer',
    ];

    // Relasi ke Status
    public function status()
    {
        return $this->belongsTo(StatusTiket::class, 'tiket_statusid', 'statustiket_id');
    }

    // Relasi ke Kategori
    public function kategori()
    {
        return $this->belongsTo(TiketKategori::class, 'tiketkategori_id', 'tiketkategori_id');
    }

    // Relasi ke Admin Handler
    public function handler()
    {
        return $this->belongsTo(Admin::class, 'tiket_handleby', 'nik');
    }

    // Relasi ke Admin / User Pemohon
    public function requester()
    {
        return $this->belongsTo(Admin::class, 'tiket_createby', 'nik');
    }

    // Relasi ke Tanggapan / Respons Tiket
    public function responses()
    {
        return $this->hasMany(TiketResponse::class, 'no_ticket', 'no_tiket')->orderBy('response_date', 'asc');
    }

    // Relasi ke Attachment / Lampiran File
    public function attachments()
    {
        return $this->hasMany(Attachment::class, 'no_tiket', 'no_tiket');
    }

    // Relasi ke Data Form Teknis Tambahan
    public function dataform()
    {
        return $this->hasOne(Dataform::class, 'no_tiket', 'no_tiket');
    }
}

