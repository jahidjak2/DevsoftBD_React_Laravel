<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Public/HomepageController.php
// Single endpoint returns ALL homepage data in one request
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\HeroSection;
use App\Models\Industry;
use App\Models\Project;
use App\Models\Service;
use App\Models\Testimonial;
use App\Models\TrustedCompany;
use App\Models\WhyChooseUs;
use App\Services\SettingService;
use Illuminate\Http\JsonResponse;

class HomepageController extends Controller
{
    public function all(): JsonResponse
    {
        return response()->json([
            'settings' => SettingService::getPublic(),
            'hero' => $this->hero(),
            'services' => $this->services(),
            'featured_projects' => $this->featuredProjects(),
            'trusted_companies' => $this->trustedCompanies(),
            'testimonials' => $this->testimonials(),
            'industries' => $this->industries(),
            'why_choose_us' => $this->whyChooseUs(),
        ]);
    }

    private function hero(): ?array
    {
        $hero = HeroSection::where('is_active', true)->with('backgroundImage')->first();
        if (! $hero) {
            return null;
        }

        return [
            'headline' => $hero->headline,
            'subheadline' => $hero->subheadline,
            'cta_primary_text' => $hero->cta_primary_text,
            'cta_primary_link' => $hero->cta_primary_link,
            'cta_secondary_text' => $hero->cta_secondary_text,
            'cta_secondary_link' => $hero->cta_secondary_link,
            'background_type' => $hero->background_type,
            'background_image_url' => $hero->backgroundImage?->url,
            'background_video_url' => $hero->background_video_url,
            'overlay_opacity' => $hero->background_overlay_opacity,
            'badge_text' => $hero->badge_text,
            'stats' => $hero->stats ?? [],
        ];
    }

    private function services(): array
    {
        return Service::active()
            ->where('is_featured', true)
            ->with('thumbnail')
            ->orderBy('sort_order')
            ->limit(8)
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'title' => $s->title,
                'slug' => $s->slug,
                'icon' => $s->icon,
                'short_description' => $s->short_description,
                'thumbnail_url' => $s->thumbnail?->url,
            ])->toArray();
    }

    private function featuredProjects(): array
    {
        return Project::published()
            ->featured()
            ->with(['thumbnail', 'tags'])
            ->orderBy('homepage_sort')
            ->limit(6)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'title' => $p->title,
                'slug' => $p->slug,
                'short_description' => $p->short_description,
                'thumbnail_url' => $p->thumbnail?->url,
                'live_url' => $p->live_url,
                'completion_date' => $p->completion_date?->format('M Y'),
                'category_tags' => $p->tags->where('type', 'category')->values()->map(fn ($t) => [
                    'name' => $t->name, 'color' => $t->color,
                ]),
                'tech_tags' => $p->tags->where('type', 'tech')->values()->map(fn ($t) => [
                    'name' => $t->name, 'color' => $t->color,
                ]),
            ])->toArray();
    }

    private function trustedCompanies(): array
    {
        return TrustedCompany::where('is_active', true)
            ->with('logo')
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'logo_url' => $c->logo?->url,
                'website_url' => $c->website_url,
            ])->toArray();
    }

    private function testimonials(): array
    {
        return Testimonial::approved()->featured()
            ->with(['clientAvatar', 'project'])
            ->orderBy('sort_order')
            ->limit(9)
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'client_name' => $t->client_name,
                'client_designation' => $t->client_designation,
                'client_company' => $t->client_company,
                'client_avatar_url' => $t->clientAvatar?->url,
                'rating' => $t->rating,
                'review_text' => $t->review_text,
                'source' => $t->source,
                'source_url' => $t->source_url,
                'project_title' => $t->project?->title,
                'project_slug' => $t->project?->slug,
            ])->toArray();
    }

    private function industries(): array
    {
        return Industry::where('is_active', true)
            ->with('icon')
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($i) => [
                'id' => $i->id,
                'name' => $i->name,
                'slug' => $i->slug,
                'icon_url' => $i->icon?->url,
                'short_description' => $i->short_description,
                'color' => $i->color,
            ])->toArray();
    }

    private function whyChooseUs(): array
    {
        return WhyChooseUs::where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($w) => [
                'id' => $w->id,
                'icon' => $w->icon,
                'icon_color' => $w->icon_color,
                'title' => $w->title,
                'description' => $w->description,
                'stat_value' => $w->stat_value,
                'stat_label' => $w->stat_label,
            ])->toArray();
    }
}
