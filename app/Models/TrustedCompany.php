<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrustedCompany extends Model
{
    protected $fillable = ['name', 'logo_id', 'website_url', 'sort_order', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function logo()
    {
        return $this->belongsTo(Media::class, 'logo_id');
    }
}
