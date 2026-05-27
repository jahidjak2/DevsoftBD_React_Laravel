<?php

// ─────────────────────────────────────────────────────────────
// app/Models/Project.php
// ─────────────────────────────────────────────────────────────

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title', 'slug', 'short_description', 'description',
        'challenge', 'solution', 'outcome',
        'client_name', 'client_country', 'client_logo_id', 'thumbnail_id',
        'live_url', 'github_url', 'case_study_url',
        'completion_date', 'duration', 'team_size',
        'status', 'is_featured', 'homepage_sort', 'sort_order',
        'meta_title', 'meta_description',
    ];

    protected $casts = [
        'completion_date' => 'date',
        'is_featured' => 'boolean',
        'team_size' => 'integer',
        'views_count' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($project) {
            if (empty($project->slug)) {
                $project->slug = static::generateUniqueSlug($project->title);
            }
        });
    }

    public static function generateUniqueSlug(string $title): string
    {
        $slug = Str::slug($title);
        $count = static::where('slug', 'LIKE', "{$slug}%")->count();

        return $count ? "{$slug}-{$count}" : $slug;
    }

    // ── Relationships ──────────────────────────────────────────
    public function thumbnail()
    {
        return $this->belongsTo(Media::class, 'thumbnail_id');
    }

    public function clientLogo()
    {
        return $this->belongsTo(Media::class, 'client_logo_id');
    }

    public function images()
    {
        return $this->hasMany(ProjectImage::class)->orderBy('sort_order');
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'project_tag');
    }

    public function techTags()
    {
        return $this->tags()->where('type', 'tech');
    }

    public function categoryTags()
    {
        return $this->tags()->where('type', 'category');
    }

    public function industryTags()
    {
        return $this->tags()->where('type', 'industry');
    }

    public function teamMembers()
    {
        return $this->belongsToMany(Employee::class, 'project_team_members')
            ->withPivot('role_on_project')
            ->withTimestamps();
    }

    public function testimonials()
    {
        return $this->hasMany(Testimonial::class);
    }

    // Related projects — same category tags, excluding self
    public function relatedProjects(int $limit = 3)
    {
        $tagIds = $this->tags()->pluck('tags.id');

        return static::published()
            ->where('id', '!=', $this->id)
            ->whereHas('tags', fn ($q) => $q->whereIn('tags.id', $tagIds))
            ->limit($limit)
            ->get();
    }

    // ── Scopes ────────────────────────────────────────────────
    public function scopePublished($query)
    {
        return $query->whereIn('status', ['published', 'featured']);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function incrementViews(): void
    {
        $this->increment('views_count');
    }
}
