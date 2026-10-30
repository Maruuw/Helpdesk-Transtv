<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterLevel extends Model
{
    protected $table = 'master_level';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'level',
    ];

    public function admins()
    {
        return $this->hasMany(Admin::class, 'level_id', 'id');
    }
}

