<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Admin/TestimonialController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use App\Services\ImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TestimonialController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $testimonials = Testimonial::with(['clientAvatar', 'project'])
            ->when($request->filled('approved'), fn ($q) => $q->where('is_approved', $request->boolean('approved')))
            ->orderBy('sort_order')
            ->paginate(20);

        return response()->json(['data' => $testimonials]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'client_name' => 'required|string|max:255',
            'client_designation' => 'nullable|string|max:255',
            'client_company' => 'nullable|string|max:255',
            'client_avatar_id' => 'nullable|exists:media,id',
            'rating' => 'integer|between:1,5',
            'review_text' => 'required|string',
            'project_id' => 'nullable|exists:projects,id',
            'source' => 'in:direct,google,clutch,upwork,fiverr,linkedin,other',
            'source_url' => 'nullable|url',
            'is_approved' => 'boolean',
            'is_featured' => 'boolean',
            'sort_order' => 'integer',
        ]);
        $t = Testimonial::create($data);

        return response()->json(['data' => $t, 'message' => 'Testimonial added.'], 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(['data' => Testimonial::with(['clientAvatar', 'project'])->findOrFail($id)]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $t = Testimonial::findOrFail($id);
        $data = $request->validate([
            'client_name' => 'sometimes|string|max:255',
            'client_designation' => 'nullable|string|max:255',
            'client_company' => 'nullable|string|max:255',
            'client_avatar_id' => 'nullable|exists:media,id',
            'rating' => 'integer|between:1,5',
            'review_text' => 'sometimes|string',
            'project_id' => 'nullable|exists:projects,id',
            'source' => 'in:direct,google,clutch,upwork,fiverr,linkedin,other',
            'source_url' => 'nullable|url',
            'is_approved' => 'boolean',
            'is_featured' => 'boolean',
            'sort_order' => 'integer',
        ]);
        $t->update($data);

        return response()->json(['data' => $t->fresh(), 'message' => 'Updated.']);
    }

    public function destroy(int $id): JsonResponse
    {
        Testimonial::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted.']);
    }

    public function approve(int $id): JsonResponse
    {
        $t = Testimonial::findOrFail($id);
        $t->update(['is_approved' => ! $t->is_approved]);

        return response()->json(['is_approved' => $t->is_approved, 'message' => $t->is_approved ? 'Approved.' : 'Unapproved.']);
    }

    public function uploadAvatar(Request $request, int $id): JsonResponse
    {
        $request->validate(['image' => 'required|image|max:3072']);
        $t = Testimonial::findOrFail($id);
        $media = app(ImageService::class)->upload($request->file('image'), 'testimonials');
        $t->update(['client_avatar_id' => $media->id]);

        return response()->json(['media' => $media, 'message' => 'Avatar updated.']);
    }
}
