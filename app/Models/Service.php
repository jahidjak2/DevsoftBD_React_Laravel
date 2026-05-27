<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id', 'title', 'slug', 'icon', 'short_description',
        'description', 'features', 'technologies', 'thumbnail_id',
        'process_steps', 'faq', 'cta_text', 'cta_link',
        'is_featured', 'sort_order', 'is_active',
        'meta_title', 'meta_description',
    ];

    protected $casts = [
        'features' => 'array',
        'technologies' => 'array',
        'process_steps' => 'array',
        'faq' => 'array',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($s) {
            if (empty($s->slug)) {
                $s->slug = Str::slug($s->title);
            }
        });
    }

    public function category()
    {
        return $this->belongsTo(ServiceCategory::class, 'category_id');
    }

    public function thumbnail()
    {
        return $this->belongsTo(Media::class, 'thumbnail_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
