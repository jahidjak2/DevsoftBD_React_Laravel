<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Admin/BlogController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $posts = BlogPost::withTrashed()
            ->with(['category', 'author', 'featuredImage'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->when($request->filled('category_id'), fn ($q) => $q->where('category_id', $request->category_id))
            ->when($request->filled('search'), fn ($q) => $q->where('title', 'like', '%'.$request->search.'%'))
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json(['data' => $posts]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'category_id' => 'nullable|exists:blog_categories,id',
            'title' => 'required|string|max:500',
            'excerpt' => 'nullable|string',
            'content' => 'required|string',
            'featured_image_id' => 'nullable|exists:media,id',
            'tags' => 'nullable|array',
            'read_time' => 'integer|min:1',
            'status' => 'in:draft,scheduled,published',
            'published_at' => 'nullable|date',
            'meta_title' => 'nullable|string|max:300',
            'meta_description' => 'nullable|string|max:500',
        ]);
        $data['author_id'] = auth()->id();
        if ($data['status'] === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }
        // Auto-generate excerpt if empty
        if (empty($data['excerpt'])) {
            $data['excerpt'] = Str::limit(strip_tags($data['content']), 200);
        }
        $post = BlogPost::create($data);

        return response()->json(['data' => $post->load(['category', 'author']), 'message' => 'Post created.'], 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(['data' => BlogPost::withTrashed()->with(['category', 'author', 'featuredImage'])->findOrFail($id)]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $post = BlogPost::withTrashed()->findOrFail($id);
        $data = $request->validate([
            'category_id' => 'nullable|exists:blog_categories,id',
            'title' => 'sometimes|string|max:500',
            'excerpt' => 'nullable|string',
            'content' => 'sometimes|string',
            'featured_image_id' => 'nullable|exists:media,id',
            'tags' => 'nullable|array',
            'read_time' => 'integer|min:1',
            'status' => 'in:draft,scheduled,published',
            'published_at' => 'nullable|date',
            'meta_title' => 'nullable|string|max:300',
            'meta_description' => 'nullable|string|max:500',
        ]);
        if (isset($data['status']) && $data['status'] === 'published' && empty($post->published_at)) {
            $data['published_at'] = now();
        }
        $post->update($data);

        return response()->json(['data' => $post->fresh(['category', 'author']), 'message' => 'Updated.']);
    }

    public function destroy(int $id): JsonResponse
    {
        BlogPost::findOrFail($id)->delete();

        return response()->json(['message' => 'Post deleted.']);
    }

    public function restore(int $id): JsonResponse
    {
        BlogPost::withTrashed()->findOrFail($id)->restore();

        return response()->json(['message' => 'Post restored.']);
    }
}
