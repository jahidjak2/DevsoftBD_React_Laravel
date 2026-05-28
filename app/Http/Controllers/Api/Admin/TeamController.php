<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Admin/TeamController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\TeamMember;
use App\Services\ImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    public function index(): JsonResponse
    {
        $members = TeamMember::with('photo')->orderBy('sort_order')->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'name' => $m->name,
                'designation' => $m->designation,
                'department' => $m->department,
                'photo_url' => $m->photo?->url,
                'is_public' => $m->is_public,
                'sort_order' => $m->sort_order,
            ]);

        return response()->json(['data' => $members]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'designation' => 'required|string|max:255',
            'department' => 'nullable|string|max:100',
            'bio' => 'nullable|string',
            'photo_id' => 'nullable|exists:media,id',
            'email' => 'nullable|email|max:255',
            'linkedin_url' => 'nullable|url',
            'github_url' => 'nullable|url',
            'twitter_url' => 'nullable|url',
            'skills' => 'nullable|array',
            'is_public' => 'boolean',
            'sort_order' => 'integer',
        ]);
        $member = TeamMember::create($data);

        return response()->json(['data' => $member, 'message' => 'Team member added.'], 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(['data' => TeamMember::with('photo')->findOrFail($id)]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $member = TeamMember::findOrFail($id);
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'designation' => 'sometimes|string|max:255',
            'department' => 'nullable|string|max:100',
            'bio' => 'nullable|string',
            'photo_id' => 'nullable|exists:media,id',
            'email' => 'nullable|email|max:255',
            'linkedin_url' => 'nullable|url',
            'github_url' => 'nullable|url',
            'twitter_url' => 'nullable|url',
            'skills' => 'nullable|array',
            'is_public' => 'boolean',
            'sort_order' => 'integer',
        ]);
        $member->update($data);

        return response()->json(['data' => $member->fresh('photo'), 'message' => 'Updated.']);
    }

    public function destroy(int $id): JsonResponse
    {
        TeamMember::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted.']);
    }

    public function uploadPhoto(Request $request, int $id): JsonResponse
    {
        $request->validate(['image' => 'required|image|max:5120']);
        $member = TeamMember::findOrFail($id);
        $media = app(ImageService::class)->upload($request->file('image'), 'team');
        $member->update(['photo_id' => $media->id]);

        return response()->json(['media' => $media, 'message' => 'Photo updated.']);
    }

    public function reorder(Request $request): JsonResponse
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer']);
        foreach ($request->ids as $order => $id) {
            TeamMember::where('id', $id)->update(['sort_order' => $order]);
        }

        return response()->json(['message' => 'Reordered.']);
    }
}
