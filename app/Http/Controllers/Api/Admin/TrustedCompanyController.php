<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Admin/TrustedCompanyController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\TrustedCompany;
use App\Services\ImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrustedCompanyController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => TrustedCompany::with('logo')->orderBy('sort_order')->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'logo_id' => 'nullable|exists:media,id',
            'website_url' => 'nullable|url|max:500',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);
        $company = TrustedCompany::create($data);

        return response()->json(['data' => $company, 'message' => 'Company added.'], 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(['data' => TrustedCompany::with('logo')->findOrFail($id)]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $company = TrustedCompany::findOrFail($id);
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'logo_id' => 'nullable|exists:media,id',
            'website_url' => 'nullable|url|max:500',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);
        $company->update($data);

        return response()->json(['data' => $company->fresh('logo'), 'message' => 'Updated.']);
    }

    public function destroy(int $id): JsonResponse
    {
        TrustedCompany::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted.']);
    }

    public function uploadLogo(Request $request, int $id): JsonResponse
    {
        $request->validate(['image' => 'required|file|mimes:png,jpg,jpeg,svg,webp|max:2048']);
        $company = TrustedCompany::findOrFail($id);
        $media = app(ImageService::class)->upload($request->file('image'), 'companies');
        $company->update(['logo_id' => $media->id]);

        return response()->json(['media' => $media, 'message' => 'Logo updated.']);
    }

    public function reorder(Request $request): JsonResponse
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer']);
        foreach ($request->ids as $order => $id) {
            TrustedCompany::where('id', $id)->update(['sort_order' => $order]);
        }

        return response()->json(['message' => 'Reordered.']);
    }
}
