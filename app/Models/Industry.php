<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Industry extends Model
{
    protected $fillable = [
        'name', 'slug', 'icon_id',
        'short_description', 'description',
        'color', 'sort_order', 'is_active',
    ];

    protected $casts = ['is_active' => 'boolean'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($m) {
            if (empty($m->slug)) {
                $m->slug = Str::slug($m->name);
            }
        });
    }

    public function icon()
    {
        return $this->belongsTo(Media::class, 'icon_id');
    }
}
