<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    protected $fillable = [
        'client_name', 'client_designation', 'client_company',
        'client_avatar_id', 'rating', 'review_text',
        'project_id', 'source', 'source_url',
        'is_approved', 'is_featured', 'sort_order',
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_approved' => 'boolean',
        'is_featured' => 'boolean',
    ];

    public function clientAvatar()
    {
        return $this->belongsTo(Media::class, 'client_avatar_id');
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
}
