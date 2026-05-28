<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Public/ServiceController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Http\JsonResponse;

class ServiceController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = ServiceCategory::where('is_active', true)
            ->with(['services' => fn ($q) => $q->active()->orderBy('sort_order')->with('thumbnail')])
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'icon' => $cat->icon,
                'services' => $cat->services->map(fn ($s) => [
                    'id' => $s->id,
                    'title' => $s->title,
                    'slug' => $s->slug,
                    'icon' => $s->icon,
                    'short_description' => $s->short_description,
                    'thumbnail_url' => $s->thumbnail?->url,
                    'is_featured' => $s->is_featured,
                ]),
            ]);

        return response()->json(['data' => $categories]);
    }

    public function show(string $slug): JsonResponse
    {
        $service = Service::active()
            ->where('slug', $slug)
            ->with(['category', 'thumbnail'])
            ->firstOrFail();

        return response()->json(['data' => [
            'id' => $service->id,
            'title' => $service->title,
            'slug' => $service->slug,
            'icon' => $service->icon,
            'category' => $service->category?->name,
            'short_description' => $service->short_description,
            'description' => $service->description,
            'features' => $service->features ?? [],
            'technologies' => $service->technologies ?? [],
            'process_steps' => $service->process_steps ?? [],
            'faq' => $service->faq ?? [],
            'thumbnail_url' => $service->thumbnail?->url,
            'cta_text' => $service->cta_text,
            'cta_link' => $service->cta_link,
            'meta_title' => $service->meta_title ?: $service->title.' | DevSoft BD',
            'meta_description' => $service->meta_description ?: $service->short_description,
        ]]);
    }
}
