<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Event extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title', 'slug', 'description', 'event_type', 'banner_id',
        'starts_at', 'ends_at', 'timezone', 'location', 'venue_name',
        'is_online', 'meeting_link', 'registration_url',
        'max_attendees', 'status', 'is_featured',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'is_online' => 'boolean',
        'is_featured' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(fn ($m) => $m->slug = $m->slug ?: Str::slug($m->title));
    }

    public function banner()
    {
        return $this->belongsTo(Media::class, 'banner_id');
    }
}
