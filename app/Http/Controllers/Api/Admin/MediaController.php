<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Admin/MediaController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Services\ImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MediaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $media = Media::query()
            ->when($request->filled('type'), function ($q) use ($request) {
                if ($request->type === 'image') {
                    $q->where('mime_type', 'like', 'image/%');
                } elseif ($request->type === 'document') {
                    $q->where('mime_type', 'like', 'application/%');
                } elseif ($request->type === 'video') {
                    $q->where('mime_type', 'like', 'video/%');
                }
            })
            ->when($request->filled('search'), fn ($q) => $q->where(fn ($sq) => $sq->where('filename', 'like', '%'.$request->search.'%')
                ->orWhere('alt_text', 'like', '%'.$request->search.'%')
            )
            )
            ->orderBy('created_at', 'desc')
            ->paginate(40);

        return response()->json(['data' => $media]);
    }

    public function upload(Request $request): JsonResponse
    {
        $request->validate(['files' => 'required|array|max:20', 'files.*' => 'file|max:20480']);
        $uploaded = [];
        foreach ($request->file('files') as $file) {
            $uploaded[] = app(ImageService::class)->upload($file, 'uploads');
        }

        return response()->json(['data' => $uploaded, 'message' => count($uploaded).' file(s) uploaded.'], 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(['data' => Media::findOrFail($id)]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $media = Media::findOrFail($id);
        $data = $request->validate([
            'alt_text' => 'nullable|string|max:500',
            'caption' => 'nullable|string|max:500',
        ]);
        $media->update($data);

        return response()->json(['data' => $media->fresh(), 'message' => 'Updated.']);
    }

    public function destroy(int $id): JsonResponse
    {
        $media = Media::findOrFail($id);
        app(ImageService::class)->delete($media);

        return response()->json(['message' => 'File deleted.']);
    }
}
