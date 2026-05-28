<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Admin/BlogCategoryController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => BlogCategory::withCount('posts')->orderBy('sort_order')->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:200',
            'description' => 'nullable|string',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        return response()->json(['data' => BlogCategory::create($data), 'message' => 'Category created.'], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $cat = BlogCategory::findOrFail($id);
        $data = $request->validate([
            'name' => 'sometimes|string|max:200',
            'description' => 'nullable|string',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);
        $cat->update($data);

        return response()->json(['data' => $cat->fresh(), 'message' => 'Updated.']);
    }

    public function destroy(int $id): JsonResponse
    {
        BlogCategory::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted.']);
    }
}
