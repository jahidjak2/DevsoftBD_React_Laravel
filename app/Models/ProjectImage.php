<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectImage extends Model
{
    protected $fillable = ['project_id', 'media_id', 'caption', 'sort_order'];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function media()
    {
        return $this->belongsTo(Media::class);
    }

    // Convenience accessor
    public function getImageUrlAttribute(): string
    {
        return $this->media?->url ?? '';
    }
}
