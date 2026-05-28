<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Admin/EventController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Services\ImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $events = Event::with('banner')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->orderBy('starts_at', 'desc')
            ->paginate(20);

        return response()->json(['data' => $events]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:500',
            'description' => 'nullable|string',
            'event_type' => 'in:webinar,conference,workshop,meetup,online',
            'banner_id' => 'nullable|exists:media,id',
            'starts_at' => 'required|date',
            'ends_at' => 'nullable|date|after:starts_at',
            'timezone' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:500',
            'venue_name' => 'nullable|string|max:300',
            'is_online' => 'boolean',
            'meeting_link' => 'nullable|url',
            'registration_url' => 'nullable|url',
            'max_attendees' => 'nullable|integer|min:1',
            'status' => 'in:upcoming,ongoing,completed,cancelled',
            'is_featured' => 'boolean',
        ]);
        $event = Event::create($data);

        return response()->json(['data' => $event, 'message' => 'Event created.'], 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(['data' => Event::with('banner')->findOrFail($id)]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $event = Event::findOrFail($id);
        $data = $request->validate([
            'title' => 'sometimes|string|max:500',
            'description' => 'nullable|string',
            'event_type' => 'in:webinar,conference,workshop,meetup,online',
            'banner_id' => 'nullable|exists:media,id',
            'starts_at' => 'sometimes|date',
            'ends_at' => 'nullable|date',
            'timezone' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:500',
            'venue_name' => 'nullable|string|max:300',
            'is_online' => 'boolean',
            'meeting_link' => 'nullable|url',
            'registration_url' => 'nullable|url',
            'max_attendees' => 'nullable|integer|min:1',
            'status' => 'in:upcoming,ongoing,completed,cancelled',
            'is_featured' => 'boolean',
        ]);
        $event->update($data);

        return response()->json(['data' => $event->fresh(), 'message' => 'Updated.']);
    }

    public function destroy(int $id): JsonResponse
    {
        Event::findOrFail($id)->delete();

        return response()->json(['message' => 'Event deleted.']);
    }

    public function uploadBanner(Request $request, int $id): JsonResponse
    {
        $request->validate(['image' => 'required|image|max:8192']);
        $event = Event::findOrFail($id);
        $media = app(ImageService::class)->upload($request->file('image'), 'events');
        $event->update(['banner_id' => $media->id]);

        return response()->json(['media' => $media, 'message' => 'Banner updated.']);
    }
}
