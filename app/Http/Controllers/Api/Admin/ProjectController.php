<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Admin/ProjectController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectImage;
use App\Services\ImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $projects = Project::withTrashed()
            ->with(['thumbnail', 'tags'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->when($request->filled('search'), fn ($q) => $q->where('title', 'like', '%'.$request->search.'%')
            )
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json(['data' => $projects]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:500',
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'challenge' => 'nullable|string',
            'solution' => 'nullable|string',
            'outcome' => 'nullable|string',
            'client_name' => 'nullable|string|max:255',
            'client_country' => 'nullable|string|max:100',
            'client_logo_id' => 'nullable|exists:media,id',
            'thumbnail_id' => 'nullable|exists:media,id',
            'live_url' => 'nullable|url|max:500',
            'github_url' => 'nullable|url|max:500',
            'case_study_url' => 'nullable|url|max:500',
            'completion_date' => 'nullable|date',
            'duration' => 'nullable|string|max:100',
            'team_size' => 'nullable|integer|min:1',
            'status' => 'in:draft,published,featured',
            'is_featured' => 'boolean',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:tags,id',
            'meta_title' => 'nullable|string|max:300',
            'meta_description' => 'nullable|string|max:500',
        ]);

        $tagIds = $data['tag_ids'] ?? [];
        unset($data['tag_ids']);

        $project = Project::create($data);
        if ($tagIds) {
            $project->tags()->sync($tagIds);
        }

        return response()->json(['data' => $project->load(['thumbnail', 'tags']), 'message' => 'Project created.'], 201);
    }

    public function show(int $id): JsonResponse
    {
        $project = Project::withTrashed()
            ->with(['thumbnail', 'clientLogo', 'images.media', 'tags'])
            ->findOrFail($id);

        return response()->json(['data' => $project]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $project = Project::withTrashed()->findOrFail($id);

        $data = $request->validate([
            'title' => 'sometimes|string|max:500',
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'challenge' => 'nullable|string',
            'solution' => 'nullable|string',
            'outcome' => 'nullable|string',
            'client_name' => 'nullable|string|max:255',
            'client_country' => 'nullable|string|max:100',
            'client_logo_id' => 'nullable|exists:media,id',
            'thumbnail_id' => 'nullable|exists:media,id',
            'live_url' => 'nullable|url|max:500',
            'github_url' => 'nullable|url|max:500',
            'case_study_url' => 'nullable|url|max:500',
            'completion_date' => 'nullable|date',
            'duration' => 'nullable|string|max:100',
            'team_size' => 'nullable|integer',
            'status' => 'in:draft,published,featured',
            'is_featured' => 'boolean',
            'homepage_sort' => 'nullable|integer',
            'sort_order' => 'nullable|integer',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:tags,id',
            'meta_title' => 'nullable|string|max:300',
            'meta_description' => 'nullable|string|max:500',
        ]);

        $tagIds = $data['tag_ids'] ?? null;
        unset($data['tag_ids']);

        $project->update($data);
        if ($tagIds !== null) {
            $project->tags()->sync($tagIds);
        }

        return response()->json(['data' => $project->fresh(['thumbnail', 'tags']), 'message' => 'Updated.']);
    }

    public function destroy(int $id): JsonResponse
    {
        Project::findOrFail($id)->delete(); // soft delete

        return response()->json(['message' => 'Project deleted.']);
    }

    // ── Image upload endpoints ─────────────────────────────────

    public function uploadThumbnail(Request $request, int $id): JsonResponse
    {
        $request->validate(['image' => 'required|image|max:10240']); // 10MB
        $project = Project::findOrFail($id);
        $media = app(ImageService::class)->upload($request->file('image'), 'projects');
        $project->update(['thumbnail_id' => $media->id]);

        return response()->json(['media' => $media, 'message' => 'Thumbnail updated.']);
    }

    public function uploadImages(Request $request, int $id): JsonResponse
    {
        $request->validate(['images.*' => 'image|max:10240', 'images' => 'required|array|max:20']);
        $project = Project::findOrFail($id);
        $maxOrder = $project->images()->max('sort_order') ?? 0;
        $result = [];

        foreach ($request->file('images') as $i => $file) {
            $media = app(ImageService::class)->upload($file, 'projects/gallery');
            $image = ProjectImage::create([
                'project_id' => $project->id,
                'media_id' => $media->id,
                'sort_order' => $maxOrder + $i + 1,
            ]);
            $result[] = ['id' => $image->id, 'image_url' => $media->url, 'thumb_url' => $media->thumb_url];
        }

        return response()->json(['data' => $result, 'message' => count($result).' image(s) uploaded.']);
    }

    public function removeImage(int $id, int $imageId): JsonResponse
    {
        $image = ProjectImage::where('project_id', $id)->findOrFail($imageId);
        $image->delete();

        return response()->json(['message' => 'Image removed.']);
    }

    public function reorderImages(Request $request, int $id): JsonResponse
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer']);
        foreach ($request->ids as $order => $imageId) {
            ProjectImage::where('project_id', $id)->where('id', $imageId)
                ->update(['sort_order' => $order]);
        }

        return response()->json(['message' => 'Images reordered.']);
    }

    public function toggleFeature(int $id): JsonResponse
    {
        $project = Project::findOrFail($id);
        $project->update(['is_featured' => ! $project->is_featured]);

        return response()->json(['is_featured' => $project->is_featured]);
    }

    public function reorder(Request $request): JsonResponse
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer']);
        foreach ($request->ids as $order => $id) {
            Project::where('id', $id)->update(['sort_order' => $order, 'homepage_sort' => $order]);
        }

        return response()->json(['message' => 'Reordered.']);
    }
}
