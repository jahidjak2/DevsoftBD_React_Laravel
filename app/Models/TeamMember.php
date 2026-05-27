<?php

// ─────────────────────────────────────────────────────────────
// app/Models/TeamMember.php
// ─────────────────────────────────────────────────────────────

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeamMember extends Model
{
    protected $fillable = [
        'name', 'designation', 'department', 'bio',
        'photo_id', 'email', 'linkedin_url', 'github_url', 'twitter_url',
        'skills', 'is_public', 'sort_order',
    ];

    protected $casts = [
        'skills' => 'array',
        'is_public' => 'boolean',
    ];

    public function photo()
    {
        return $this->belongsTo(Media::class, 'photo_id');
    }

    public function getPhotoUrlAttribute(): string
    {
        return $this->photo?->url ?? '';
    }
}
