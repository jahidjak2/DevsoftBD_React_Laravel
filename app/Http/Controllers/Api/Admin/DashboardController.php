<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Admin/DashboardController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Models\Employee;
use App\Models\Inquiry;
use App\Models\InternalProject;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        return response()->json([
            'stats' => [
                [
                    'label' => 'Published projects',
                    'value' => Project::published()->count(),
                    'icon' => 'ti-folder',
                ],
                [
                    'label' => 'New inquiries (7d)',
                    'value' => Inquiry::where('status', 'new')->where('created_at', '>=', now()->subDays(7))->count(),
                    'icon' => 'ti-mail',
                ],
                [
                    'label' => 'Active employees',
                    'value' => Employee::active()->count(),
                    'icon' => 'ti-users',
                ],
                [
                    'label' => 'Active projects',
                    'value' => InternalProject::where('status', 'active')->count(),
                    'icon' => 'ti-briefcase',
                ],
                [
                    'label' => 'Open tasks',
                    'value' => Task::whereIn('status', ['todo', 'in_progress', 'in_review'])->count(),
                    'icon' => 'ti-checklist',
                ],
                [
                    'label' => 'Blog posts published',
                    'value' => BlogPost::published()->count(),
                    'icon' => 'ti-article',
                ],
            ],
            'recent_inquiries' => Inquiry::latest()->limit(5)->get(['id', 'name', 'email', 'subject', 'status', 'created_at']),
            'recent_projects' => Project::with('thumbnail')->latest()->limit(5)->get(['id', 'title', 'slug', 'status', 'created_at']),
            'pending_tasks' => Task::with('assignee.user')
                ->whereIn('status', ['todo', 'in_progress'])
                ->where('due_date', '<=', now()->addDays(7))
                ->orderBy('due_date')
                ->limit(5)
                ->get(['id', 'title', 'status', 'priority', 'due_date', 'assigned_to']),
        ]);
    }
}
