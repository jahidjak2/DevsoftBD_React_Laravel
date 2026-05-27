<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HeroSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'headline', 'subheadline',
        'cta_primary_text', 'cta_primary_link',
        'cta_secondary_text', 'cta_secondary_link',
        'background_type', 'background_image_id', 'background_video_url',
        'background_overlay_opacity', 'badge_text', 'stats', 'is_active',
    ];

    protected $casts = [
        'stats' => 'array',
        'is_active' => 'boolean',
        'background_overlay_opacity' => 'integer',
    ];

    public function backgroundImage()
    {
        return $this->belongsTo(Media::class, 'background_image_id');
    }
}
