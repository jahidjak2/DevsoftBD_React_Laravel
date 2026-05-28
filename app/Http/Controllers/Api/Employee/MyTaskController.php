<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Employee/MyTaskController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Employee;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\TaskTimeLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MyTaskController extends Controller
{
    private function employeeId(Request $request): int
    {
        $id = $request->user()->employee?->id;
        abort_unless($id, 403, 'No employee record linked to this account.');

        return $id;
    }

    public function index(Request $request): JsonResponse
    {
        $employeeId = $this->employeeId($request);

        $tasks = Task::where('assigned_to', $employeeId)
            ->with(['project', 'milestone'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->orderByRaw("FIELD(status,'in_progress','in_review','todo','done','cancelled')")
            ->orderBy('due_date')
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'title' => $t->title,
                'status' => $t->status,
                'priority' => $t->priority,
                'due_date' => $t->due_date?->format('Y-m-d'),
                'is_overdue' => $t->due_date && $t->due_date->isPast() && ! in_array($t->status, ['done', 'cancelled']),
                'estimated_hours' => $t->estimated_hours,
                'logged_hours' => $t->logged_hours,
                'project_name' => $t->project?->name,
                'project_code' => $t->project?->code,
                'milestone' => $t->milestone?->title,
                'comment_count' => $t->comments()->count(),
                'tags' => $t->tags ?? [],
            ]);

        return response()->json(['data' => $tasks]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $employeeId = $this->employeeId($request);
        $task = Task::where('assigned_to', $employeeId)
            ->with(['project', 'milestone', 'creator', 'comments.user', 'timeLogs'])
            ->findOrFail($id);

        return response()->json(['data' => [
            'id' => $task->id,
            'title' => $task->title,
            'description' => $task->description,
            'status' => $task->status,
            'priority' => $task->priority,
            'due_date' => $task->due_date?->format('Y-m-d'),
            'estimated_hours' => $task->estimated_hours,
            'logged_hours' => $task->logged_hours,
            'tags' => $task->tags ?? [],
            'project_name' => $task->project?->name,
            'milestone' => $task->milestone?->title,
            'created_by' => $task->creator?->name,
            'comments' => $task->comments->map(fn ($c) => [
                'id' => $c->id,
                'comment' => $c->comment,
                'user' => $c->user?->name,
                'created_at' => $c->created_at->diffForHumans(),
            ]),
            'time_logs' => $task->timeLogs->where('employee_id', $employeeId)->map(fn ($l) => [
                'id' => $l->id,
                'hours' => $l->hours,
                'date' => $l->date?->format('Y-m-d'),
                'note' => $l->note,
            ]),
        ]]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $employeeId = $this->employeeId($request);
        $request->validate(['status' => 'required|in:in_progress,in_review,done']);
        // Employees can only move their own tasks forward (not cancel or re-open)
        $task = Task::where('assigned_to', $employeeId)->findOrFail($id);
        $task->update(['status' => $request->status]);

        return response()->json(['message' => 'Status updated to '.$request->status.'.']);
    }

    public function addComment(Request $request, int $id): JsonResponse
    {
        $employeeId = $this->employeeId($request);
        $request->validate(['comment' => 'required|string|max:5000']);
        // Employees can comment on any task in their project, not just assigned ones
        Task::where('assigned_to', $employeeId)->findOrFail($id);
        $comment = TaskComment::create([
            'task_id' => $id,
            'user_id' => $request->user()->id,
            'comment' => $request->comment,
        ]);

        return response()->json(['data' => ['id' => $comment->id, 'comment' => $comment->comment, 'created_at' => $comment->created_at->diffForHumans()], 'message' => 'Comment added.'], 201);
    }

    public function logTime(Request $request, int $id): JsonResponse
    {
        $employeeId = $this->employeeId($request);
        $request->validate([
            'hours' => 'required|numeric|min:0.25|max:24',
            'date' => 'required|date',
            'note' => 'nullable|string|max:500',
        ]);
        Task::where('assigned_to', $employeeId)->findOrFail($id);
        $log = TaskTimeLog::create([
            'task_id' => $id,
            'employee_id' => $employeeId,
            'hours' => $request->hours,
            'date' => $request->date,
            'note' => $request->note,
        ]);

        return response()->json(['data' => $log, 'message' => $request->hours.'h logged.'], 201);
    }
}
