<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Admin/IndustryController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Industry;
use App\Services\ImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IndustryController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => Industry::with('icon')->orderBy('sort_order')->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:200',
            'icon_id' => 'nullable|exists:media,id',
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:20',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);
        $industry = Industry::create($data);

        return response()->json(['data' => $industry, 'message' => 'Industry added.'], 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(['data' => Industry::with('icon')->findOrFail($id)]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $industry = Industry::findOrFail($id);
        $data = $request->validate([
            'name' => 'sometimes|string|max:200',
            'icon_id' => 'nullable|exists:media,id',
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:20',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);
        $industry->update($data);

        return response()->json(['data' => $industry->fresh('icon'), 'message' => 'Updated.']);
    }

    public function destroy(int $id): JsonResponse
    {
        Industry::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted.']);
    }

    public function uploadIcon(Request $request, int $id): JsonResponse
    {
        $request->validate(['image' => 'required|file|mimes:png,jpg,jpeg,svg,webp|max:2048']);
        $industry = Industry::findOrFail($id);
        $media = app(ImageService::class)->upload($request->file('image'), 'industries');
        $industry->update(['icon_id' => $media->id]);

        return response()->json(['media' => $media, 'message' => 'Icon updated.']);
    }

    public function reorder(Request $request): JsonResponse
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer']);
        foreach ($request->ids as $order => $id) {
            Industry::where('id', $id)->update(['sort_order' => $order]);
        }

        return response()->json(['message' => 'Reordered.']);
    }
}
