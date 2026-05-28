<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Admin/WhyChooseUsController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\WhyChooseUs;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WhyChooseUsController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => WhyChooseUs::orderBy('sort_order')->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'icon' => 'nullable|string|max:100',
            'icon_color' => 'nullable|string|max:20',
            'title' => 'required|string|max:200',
            'description' => 'required|string',
            'stat_value' => 'nullable|string|max:50',
            'stat_label' => 'nullable|string|max:100',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);
        $item = WhyChooseUs::create($data);

        return response()->json(['data' => $item, 'message' => 'Reason added.'], 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(['data' => WhyChooseUs::findOrFail($id)]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $item = WhyChooseUs::findOrFail($id);
        $data = $request->validate([
            'icon' => 'nullable|string|max:100',
            'icon_color' => 'nullable|string|max:20',
            'title' => 'sometimes|string|max:200',
            'description' => 'sometimes|string',
            'stat_value' => 'nullable|string|max:50',
            'stat_label' => 'nullable|string|max:100',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);
        $item->update($data);

        return response()->json(['data' => $item->fresh(), 'message' => 'Updated.']);
    }

    public function destroy(int $id): JsonResponse
    {
        WhyChooseUs::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted.']);
    }

    public function reorder(Request $request): JsonResponse
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer']);
        foreach ($request->ids as $order => $id) {
            WhyChooseUs::where('id', $id)->update(['sort_order' => $order]);
        }

        return response()->json(['message' => 'Reordered.']);
    }
}
