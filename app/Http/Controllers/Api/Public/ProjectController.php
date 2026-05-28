<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Public/ProjectController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Project::published()->with(['thumbnail', 'tags']);

        // Filter by tag slug (category, tech, industry)
        if ($request->filled('category')) {
            $query->whereHas('tags', fn ($q) => $q->where('type', 'category')->where('slug', $request->category)
            );
        }
        if ($request->filled('tech')) {
            $query->whereHas('tags', fn ($q) => $q->where('type', 'tech')->where('slug', $request->tech)
            );
        }
        if ($request->filled('industry')) {
            $query->whereHas('tags', fn ($q) => $q->where('type', 'industry')->where('slug', $request->industry)
            );
        }
        if ($request->filled('search')) {
            $query->where('title', 'like', '%'.$request->search.'%');
        }

        $projects = $query->orderBy('sort_order')->paginate(12);

        return response()->json([
            'data' => $projects->getCollection()->map(fn ($p) => $this->formatCard($p)),
            'meta' => [
                'total' => $projects->total(),
                'per_page' => $projects->perPage(),
                'current_page' => $projects->currentPage(),
                'last_page' => $projects->lastPage(),
            ],
        ]);
    }

    public function featured(): JsonResponse
    {
        $projects = Project::published()->featured()
            ->with(['thumbnail', 'tags'])
            ->orderBy('homepage_sort')
            ->limit(6)
            ->get()
            ->map(fn ($p) => $this->formatCard($p));

        return response()->json(['data' => $projects]);
    }

    public function show(string $slug): JsonResponse
    {
        $project = Project::published()
            ->where('slug', $slug)
            ->with([
                'thumbnail', 'clientLogo',
                'images.media',
                'tags',
                'teamMembers.avatar',
            ])
            ->firstOrFail();

        return response()->json(['data' => $this->formatDetail($project)]);
    }

    public function incrementView(string $slug): JsonResponse
    {
        $project = Project::published()->where('slug', $slug)->firstOrFail();
        $project->incrementViews();

        return response()->json(['ok' => true]);
    }

    private function formatCard(Project $p): array
    {
        return [
            'id' => $p->id,
            'title' => $p->title,
            'slug' => $p->slug,
            'short_description' => $p->short_description,
            'thumbnail_url' => $p->thumbnail?->url,
            'thumb_url' => $p->thumbnail?->thumb_url,
            'live_url' => $p->live_url,
            'is_featured' => $p->is_featured,
            'completion_date' => $p->completion_date?->format('M Y'),
            'category_tags' => $p->tags->where('type', 'category')->values()
                ->map(fn ($t) => ['id' => $t->id, 'name' => $t->name, 'slug' => $t->slug, 'color' => $t->color]),
            'tech_tags' => $p->tags->where('type', 'tech')->values()
                ->map(fn ($t) => ['id' => $t->id, 'name' => $t->name, 'slug' => $t->slug, 'color' => $t->color]),
        ];
    }

    private function formatDetail(Project $p): array
    {
        $related = $p->relatedProjects(3);

        return [
            'id' => $p->id,
            'title' => $p->title,
            'slug' => $p->slug,
            'short_description' => $p->short_description,
            'description' => $p->description,
            'challenge' => $p->challenge,
            'solution' => $p->solution,
            'outcome' => $p->outcome,
            'client_name' => $p->client_name,
            'client_country' => $p->client_country,
            'client_logo_url' => $p->clientLogo?->url,
            'thumbnail_url' => $p->thumbnail?->url,
            'images' => $p->images->map(fn ($img) => [
                'id' => $img->id,
                'image_url' => $img->media?->url,
                'thumb_url' => $img->media?->thumb_url,
                'caption' => $img->caption,
            ]),
            'live_url' => $p->live_url,
            'github_url' => $p->github_url,
            'case_study_url' => $p->case_study_url,
            'completion_date' => $p->completion_date?->format('F Y'),
            'duration' => $p->duration,
            'team_size' => $p->team_size,
            'views_count' => $p->views_count,
            'all_tags' => $p->tags->map(fn ($t) => ['id' => $t->id, 'name' => $t->name, 'type' => $t->type, 'color' => $t->color]),
            'tech_tags' => $p->tags->where('type', 'tech')->values()->map(fn ($t) => ['id' => $t->id, 'name' => $t->name, 'color' => $t->color]),
            'category_tags' => $p->tags->where('type', 'category')->values()->map(fn ($t) => ['id' => $t->id, 'name' => $t->name, 'color' => $t->color]),
            'industry_tags' => $p->tags->where('type', 'industry')->values()->map(fn ($t) => ['id' => $t->id, 'name' => $t->name, 'color' => $t->color]),
            'team_members' => $p->teamMembers->map(fn ($e) => [
                'id' => $e->id,
                'name' => $e->user?->name,
                'avatar_url' => $e->avatar?->url,
                'role_on_project' => $e->pivot->role_on_project,
            ]),
            'related_projects' => $related->map(fn ($r) => $this->formatCard($r)),
            'meta_title' => $p->meta_title ?: $p->title.' | DevSoft BD',
            'meta_description' => $p->meta_description ?: $p->short_description,
        ];
    }
}
