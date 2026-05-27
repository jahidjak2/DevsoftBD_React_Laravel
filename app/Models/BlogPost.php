<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class BlogPost extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'category_id', 'author_id', 'title', 'slug', 'excerpt',
        'content', 'featured_image_id', 'tags', 'read_time',
        'status', 'published_at', 'meta_title', 'meta_description',
    ];

    protected $casts = [
        'tags' => 'array',
        'published_at' => 'datetime',
        'read_time' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(fn ($m) => $m->slug = $m->slug ?: Str::slug($m->title));
    }

    public function category()
    {
        return $this->belongsTo(BlogCategory::class, 'category_id');
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function featuredImage()
    {
        return $this->belongsTo(Media::class, 'featured_image_id');
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published')
            ->where('published_at', '<=', now());
    }
}
