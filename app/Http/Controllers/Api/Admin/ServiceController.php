<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Admin/ServiceController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Services\ImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $services = Service::with(['category', 'thumbnail'])
            ->when($request->filled('category_id'), fn ($q) => $q->where('category_id', $request->category_id))
            ->when($request->filled('active'), fn ($q) => $q->where('is_active', $request->boolean('active')))
            ->orderBy('sort_order')
            ->paginate(20);

        return response()->json(['data' => $services]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'category_id' => 'nullable|exists:service_categories,id',
            'title' => 'required|string|max:300',
            'icon' => 'nullable|string|max:100',
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'features' => 'nullable|array',
            'technologies' => 'nullable|array',
            'thumbnail_id' => 'nullable|exists:media,id',
            'process_steps' => 'nullable|array',
            'faq' => 'nullable|array',
            'cta_text' => 'nullable|string|max:200',
            'cta_link' => 'nullable|url',
            'is_featured' => 'boolean',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
            'meta_title' => 'nullable|string|max:300',
            'meta_description' => 'nullable|string|max:500',
        ]);
        $service = Service::create($data);

        return response()->json(['data' => $service->load('category'), 'message' => 'Service created.'], 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(['data' => Service::with(['category', 'thumbnail'])->findOrFail($id)]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $service = Service::findOrFail($id);
        $data = $request->validate([
            'category_id' => 'nullable|exists:service_categories,id',
            'title' => 'sometimes|string|max:300',
            'icon' => 'nullable|string|max:100',
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'features' => 'nullable|array',
            'technologies' => 'nullable|array',
            'thumbnail_id' => 'nullable|exists:media,id',
            'process_steps' => 'nullable|array',
            'faq' => 'nullable|array',
            'cta_text' => 'nullable|string|max:200',
            'cta_link' => 'nullable|url',
            'is_featured' => 'boolean',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
            'meta_title' => 'nullable|string|max:300',
            'meta_description' => 'nullable|string|max:500',
        ]);
        $service->update($data);

        return response()->json(['data' => $service->fresh('category'), 'message' => 'Updated.']);
    }

    public function destroy(int $id): JsonResponse
    {
        Service::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted.']);
    }

    public function uploadThumbnail(Request $request, int $id): JsonResponse
    {
        $request->validate(['image' => 'required|image|max:5120']);
        $service = Service::findOrFail($id);
        $media = app(ImageService::class)->upload($request->file('image'), 'services');
        $service->update(['thumbnail_id' => $media->id]);

        return response()->json(['media' => $media, 'message' => 'Thumbnail updated.']);
    }

    public function reorder(Request $request): JsonResponse
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer']);
        foreach ($request->ids as $order => $id) {
            Service::where('id', $id)->update(['sort_order' => $order]);
        }

        return response()->json(['message' => 'Reordered.']);
    }
}
