<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attachment extends Model
{
    protected $table = 'tbl_attachment';
    protected $primaryKey = 'id_attachment';
    public $timestamps = false;

    protected $fillable = [
        'id_attachment',
        'filename',
        'path_file',
        'no_tiket',
    ];

    public function ticket()
    {
        return $this->belongsTo(Tiket::class, 'no_tiket', 'no_tiket');
    }
}

