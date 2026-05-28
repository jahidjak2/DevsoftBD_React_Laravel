<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Public/TeamController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\TeamMember;
use Illuminate\Http\JsonResponse;

class TeamController extends Controller
{
    public function index(): JsonResponse
    {
        $members = TeamMember::where('is_public', true)
            ->with('photo')
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'name' => $m->name,
                'designation' => $m->designation,
                'department' => $m->department,
                'bio' => $m->bio,
                'photo_url' => $m->photo?->url,
                'skills' => $m->skills ?? [],
                'linkedin_url' => $m->linkedin_url,
                'github_url' => $m->github_url,
                'twitter_url' => $m->twitter_url,
            ]);

        return response()->json(['data' => $members]);
    }
}
