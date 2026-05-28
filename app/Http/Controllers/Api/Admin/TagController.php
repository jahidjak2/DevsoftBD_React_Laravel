<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Admin/TagController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tags = Tag::query()
            ->when($request->filled('type'), fn ($q) => $q->where('type', $request->type))
            ->withCount('projects')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $tags]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'type' => 'required|in:tech,category,industry',
            'color' => 'nullable|string|max:20',
        ]);
        $tag = Tag::create($data);

        return response()->json(['data' => $tag, 'message' => 'Tag created.'], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $tag = Tag::findOrFail($id);
        $data = $request->validate([
            'name' => 'sometimes|string|max:100',
            'type' => 'in:tech,category,industry',
            'color' => 'nullable|string|max:20',
        ]);
        $tag->update($data);

        return response()->json(['data' => $tag->fresh(), 'message' => 'Updated.']);
    }

    public function destroy(int $id): JsonResponse
    {
        Tag::findOrFail($id)->delete();

        return response()->json(['message' => 'Tag deleted.']);
    }
}
