<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Admin/ServiceCategoryController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $cats = ServiceCategory::withCount('services')->orderBy('sort_order')->get();

        return response()->json(['data' => $cats]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:200',
            'icon' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);
        $cat = ServiceCategory::create($data);

        return response()->json(['data' => $cat, 'message' => 'Category created.'], 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(['data' => ServiceCategory::withCount('services')->findOrFail($id)]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $cat = ServiceCategory::findOrFail($id);
        $data = $request->validate([
            'name' => 'sometimes|string|max:200',
            'icon' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);
        $cat->update($data);

        return response()->json(['data' => $cat->fresh(), 'message' => 'Updated.']);
    }

    public function destroy(int $id): JsonResponse
    {
        ServiceCategory::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted.']);
    }
}
