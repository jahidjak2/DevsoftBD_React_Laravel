<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Employee/MyProjectController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Employee;

use App\Http\Controllers\Controller;
use App\Models\InternalProject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MyProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $employeeId = $request->user()->employee?->id;
        abort_unless($employeeId, 403);

        $projects = InternalProject::whereHas('members', fn ($q) => $q->where('employee_id', $employeeId))
            ->with(['manager.user', 'milestones'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->orderBy('status')
            ->orderBy('deadline')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'code' => $p->code,
                'status' => $p->status,
                'priority' => $p->priority,
                'deadline' => $p->deadline?->format('Y-m-d'),
                'manager' => $p->manager?->user?->name,
                'technologies' => $p->technologies ?? [],
                'milestone_count' => $p->milestones->count(),
                'completed_milestones' => $p->milestones->whereNotNull('completed_at')->count(),
                'my_role' => $p->members->where('id', $employeeId)->first()?->pivot->role,
            ]);

        return response()->json(['data' => $projects]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $employeeId = $request->user()->employee?->id;
        abort_unless($employeeId, 403);

        $project = InternalProject::whereHas('members', fn ($q) => $q->where('employee_id', $employeeId))
            ->with(['manager.user', 'members.user', 'milestones', 'portfolioProject'])
            ->findOrFail($id);

        return response()->json(['data' => [
            'id' => $project->id,
            'name' => $project->name,
            'code' => $project->code,
            'description' => $project->description,
            'status' => $project->status,
            'priority' => $project->priority,
            'start_date' => $project->start_date?->format('Y-m-d'),
            'deadline' => $project->deadline?->format('Y-m-d'),
            'manager' => $project->manager?->user?->name,
            'technologies' => $project->technologies ?? [],
            'notes' => $project->notes,
            'milestones' => $project->milestones->map(fn ($m) => [
                'title' => $m->title,
                'due_date' => $m->due_date?->format('Y-m-d'),
                'completed_at' => $m->completed_at?->format('Y-m-d'),
            ]),
            'team' => $project->members->map(fn ($e) => [
                'name' => $e->user?->name,
                'designation' => $e->designation,
                'role' => $e->pivot->role,
            ]),
        ]]);
    }
}
