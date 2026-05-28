<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Admin/HeroController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\HeroSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HeroController extends Controller
{
    public function index(): JsonResponse
    {
        $heroes = HeroSection::with('backgroundImage')->orderBy('created_at', 'desc')->get();

        return response()->json(['data' => $heroes]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'headline' => 'required|string|max:500',
            'subheadline' => 'nullable|string|max:1000',
            'cta_primary_text' => 'nullable|string|max:100',
            'cta_primary_link' => 'nullable|string|max:500',
            'cta_secondary_text' => 'nullable|string|max:100',
            'cta_secondary_link' => 'nullable|string|max:500',
            'background_type' => 'in:image,video,gradient',
            'background_image_id' => 'nullable|exists:media,id',
            'background_video_url' => 'nullable|url',
            'background_overlay_opacity' => 'integer|between:0,100',
            'badge_text' => 'nullable|string|max:200',
            'stats' => 'nullable|array',
        ]);

        $hero = HeroSection::create($data);

        return response()->json(['data' => $hero, 'message' => 'Hero section created.'], 201);
    }

    public function show(int $id): JsonResponse
    {
        $hero = HeroSection::with('backgroundImage')->findOrFail($id);

        return response()->json(['data' => $hero]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $hero = HeroSection::findOrFail($id);
        $data = $request->validate([
            'headline' => 'sometimes|string|max:500',
            'subheadline' => 'nullable|string|max:1000',
            'cta_primary_text' => 'nullable|string|max:100',
            'cta_primary_link' => 'nullable|string|max:500',
            'cta_secondary_text' => 'nullable|string|max:100',
            'cta_secondary_link' => 'nullable|string|max:500',
            'background_type' => 'in:image,video,gradient',
            'background_image_id' => 'nullable|exists:media,id',
            'background_video_url' => 'nullable|url',
            'background_overlay_opacity' => 'integer|between:0,100',
            'badge_text' => 'nullable|string|max:200',
            'stats' => 'nullable|array',
        ]);

        $hero->update($data);

        return response()->json(['data' => $hero->fresh('backgroundImage'), 'message' => 'Updated.']);
    }

    public function destroy(int $id): JsonResponse
    {
        HeroSection::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted.']);
    }

    public function activate(int $id): JsonResponse
    {
        // Deactivate all others first
        HeroSection::where('id', '!=', $id)->update(['is_active' => false]);
        HeroSection::findOrFail($id)->update(['is_active' => true]);

        return response()->json(['message' => 'Hero section activated.']);
    }
}
