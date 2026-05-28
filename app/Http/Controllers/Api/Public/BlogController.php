<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Public/BlogController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $posts = BlogPost::published()
            ->with(['category', 'author', 'featuredImage'])
            ->when($request->filled('category'), fn ($q) => $q->whereHas('category', fn ($sq) => $sq->where('slug', $request->category))
            )
            ->orderBy('published_at', 'desc')
            ->paginate(12);

        return response()->json([
            'data' => $posts->getCollection()->map(fn ($p) => [
                'id' => $p->id,
                'title' => $p->title,
                'slug' => $p->slug,
                'excerpt' => $p->excerpt,
                'featured_image_url' => $p->featuredImage?->url,
                'thumb_url' => $p->featuredImage?->thumb_url,
                'category' => $p->category?->name,
                'author' => $p->author?->name,
                'read_time' => $p->read_time,
                'published_at' => $p->published_at?->format('d M Y'),
                'tags' => $p->tags ?? [],
            ]),
            'meta' => [
                'total' => $posts->total(),
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
            ],
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $post = BlogPost::published()
            ->where('slug', $slug)
            ->with(['category', 'author', 'featuredImage'])
            ->firstOrFail();

        $post->increment('views_count');

        return response()->json(['data' => [
            'id' => $post->id,
            'title' => $post->title,
            'slug' => $post->slug,
            'content' => $post->content,
            'excerpt' => $post->excerpt,
            'featured_image_url' => $post->featuredImage?->url,
            'category' => $post->category?->name,
            'author' => $post->author?->name,
            'read_time' => $post->read_time,
            'published_at' => $post->published_at?->format('d M Y'),
            'tags' => $post->tags ?? [],
            'views_count' => $post->views_count,
            'meta_title' => $post->meta_title ?: $post->title.' | DevSoft BD Blog',
            'meta_description' => $post->meta_description ?: $post->excerpt,
        ]]);
    }
}
