<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Admin/SiteSettingController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Services\ImageService;
use App\Services\SettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SiteSettingController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = SiteSetting::orderBy('group')->orderBy('id')->get()
            ->groupBy('group')
            ->map(fn ($group) => $group->keyBy('key'));

        return response()->json(['data' => $settings]);
    }

    public function bulkUpdate(Request $request): JsonResponse
    {
        $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string|max:100',
            'settings.*.value' => 'nullable',
        ]);

        foreach ($request->settings as $item) {
            SettingService::set($item['key'], $item['value']);
        }

        SettingService::clearCache();

        return response()->json(['message' => 'Settings saved successfully.']);
    }

    public function uploadImage(Request $request, string $key): JsonResponse
    {
        $request->validate(['image' => 'required|image|max:5120']); // 5MB max

        $media = app(ImageService::class)->upload($request->file('image'), 'settings');
        SettingService::set($key, $media->url);

        return response()->json([
            'message' => 'Image uploaded.',
            'url' => $media->url,
            'media' => $media,
        ]);
    }
}
