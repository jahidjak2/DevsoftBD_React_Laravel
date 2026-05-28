<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Public/EventController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $events = Event::with('banner')
            ->whereIn('status', ['upcoming', 'ongoing'])
            ->when($request->filled('type'), fn ($q) => $q->where('event_type', $request->type))
            ->orderBy('starts_at')
            ->paginate(12);

        return response()->json(['data' => $events->getCollection()->map(fn ($e) => [
            'id' => $e->id,
            'title' => $e->title,
            'slug' => $e->slug,
            'event_type' => $e->event_type,
            'banner_url' => $e->banner?->url,
            'starts_at' => $e->starts_at?->format('D, d M Y'),
            'starts_at_time' => $e->starts_at?->format('g:i A'),
            'ends_at' => $e->ends_at?->format('g:i A'),
            'timezone' => $e->timezone,
            'location' => $e->location,
            'is_online' => $e->is_online,
            'registration_url' => $e->registration_url,
            'status' => $e->status,
            'is_featured' => $e->is_featured,
        ])]);
    }

    public function show(string $slug): JsonResponse
    {
        $event = Event::with('banner')->where('slug', $slug)->firstOrFail();

        return response()->json(['data' => [
            'id' => $event->id,
            'title' => $event->title,
            'description' => $event->description,
            'event_type' => $event->event_type,
            'banner_url' => $event->banner?->url,
            'starts_at' => $event->starts_at?->toIso8601String(),
            'ends_at' => $event->ends_at?->toIso8601String(),
            'timezone' => $event->timezone,
            'location' => $event->location,
            'venue_name' => $event->venue_name,
            'is_online' => $event->is_online,
            'meeting_link' => $event->is_online ? $event->meeting_link : null, // hide until registered
            'registration_url' => $event->registration_url,
            'max_attendees' => $event->max_attendees,
            'status' => $event->status,
        ]]);
    }
}
