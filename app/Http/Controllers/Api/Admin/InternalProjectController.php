<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Admin/InternalProjectController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\InternalProject;
use App\Models\Milestone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InternalProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $projects = InternalProject::with(['manager.user', 'members.user'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', '%'.$request->search.'%'))
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json(['data' => $projects]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:500',
            'description' => 'nullable|string',
            'client_name' => 'nullable|string|max:255',
            'client_contact' => 'nullable|string|max:255',
            'manager_id' => 'nullable|exists:employees,id',
            'start_date' => 'required|date',
            'deadline' => 'nullable|date|after:start_date',
            'status' => 'in:planning,active,on_hold,completed,cancelled',
            'priority' => 'in:low,medium,high,critical',
            'budget' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:10',
            'technologies' => 'nullable|array',
            'notes' => 'nullable|string',
            'is_billable' => 'boolean',
            'portfolio_project_id' => 'nullable|exists:projects,id',
        ]);
        $data['code'] = InternalProject::generateCode();
        $project = InternalProject::create($data);

        return response()->json(['data' => $project, 'message' => 'Project created. Code: '.$project->code], 201);
    }

    public function show(int $id): JsonResponse
    {
        $project = InternalProject::with([
            'manager.user', 'members.user', 'milestones',
            'tasks' => fn ($q) => $q->withCount('comments'),
            'portfolioProject',
        ])->findOrFail($id);

        return response()->json(['data' => $project]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $project = InternalProject::findOrFail($id);
        $data = $request->validate([
            'name' => 'sometimes|string|max:500',
            'description' => 'nullable|string',
            'client_name' => 'nullable|string|max:255',
            'client_contact' => 'nullable|string|max:255',
            'manager_id' => 'nullable|exists:employees,id',
            'start_date' => 'sometimes|date',
            'deadline' => 'nullable|date',
            'completed_at' => 'nullable|date',
            'status' => 'in:planning,active,on_hold,completed,cancelled',
            'priority' => 'in:low,medium,high,critical',
            'budget' => 'nullable|numeric',
            'currency' => 'nullable|string|max:10',
            'technologies' => 'nullable|array',
            'notes' => 'nullable|string',
            'is_billable' => 'boolean',
            'portfolio_project_id' => 'nullable|exists:projects,id',
        ]);
        $project->update($data);

        return response()->json(['data' => $project->fresh(), 'message' => 'Updated.']);
    }

    public function destroy(int $id): JsonResponse
    {
        InternalProject::findOrFail($id)->delete();

        return response()->json(['message' => 'Project deleted.']);
    }

    public function addMember(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'role' => 'nullable|string|max:100',
            'hourly_rate' => 'nullable|numeric',
        ]);
        $project = InternalProject::findOrFail($id);
        $project->members()->syncWithoutDetaching([
            $request->employee_id => [
                'role' => $request->role,
                'joined_at' => now()->toDateString(),
                'hourly_rate' => $request->hourly_rate,
            ],
        ]);

        return response()->json(['message' => 'Member added.']);
    }

    public function removeMember(int $id, int $employeeId): JsonResponse
    {
        InternalProject::findOrFail($id)->members()->detach($employeeId);

        return response()->json(['message' => 'Member removed.']);
    }

    // ── Milestones ─────────────────────────────────────────
    public function storeMilestone(Request $request, int $projectId): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:300',
            'description' => 'nullable|string',
            'due_date' => 'required|date',
            'sort_order' => 'integer',
        ]);
        InternalProject::findOrFail($projectId);
        $ms = Milestone::create(['internal_project_id' => $projectId] + $request->only('title', 'description', 'due_date', 'sort_order'));

        return response()->json(['data' => $ms, 'message' => 'Milestone created.'], 201);
    }

    public function updateMilestone(Request $request, int $projectId, int $msId): JsonResponse
    {
        $ms = Milestone::where('internal_project_id', $projectId)->findOrFail($msId);
        $ms->update($request->validate([
            'title' => 'sometimes|string|max:300',
            'description' => 'nullable|string',
            'due_date' => 'sometimes|date',
            'completed_at' => 'nullable|date',
            'sort_order' => 'integer',
        ]));

        return response()->json(['data' => $ms->fresh(), 'message' => 'Updated.']);
    }

    public function destroyMilestone(int $projectId, int $msId): JsonResponse
    {
        Milestone::where('internal_project_id', $projectId)->findOrFail($msId)->delete();

        return response()->json(['message' => 'Milestone deleted.']);
    }
}
