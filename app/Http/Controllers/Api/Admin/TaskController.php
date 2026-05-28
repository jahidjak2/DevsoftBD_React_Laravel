<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Admin/TaskController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\TaskTimeLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tasks = Task::with(['assignee.user', 'assignee.avatar', 'creator', 'milestone'])
            ->when($request->filled('project_id'), fn ($q) => $q->where('internal_project_id', $request->project_id)
            )
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status)
            )
            ->when($request->filled('assigned_to'), fn ($q) => $q->where('assigned_to', $request->assigned_to)
            )
            ->orderBy('sort_order')
            ->get()
            ->groupBy('status'); // Returns kanban columns

        return response()->json(['data' => $tasks->map(fn ($col) => $col->map(fn ($t) => $this->format($t)))]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'internal_project_id' => 'required|exists:internal_projects,id',
            'milestone_id' => 'nullable|exists:milestones,id',
            'title' => 'required|string|max:500',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:employees,id',
            'status' => 'in:todo,in_progress,in_review,done,cancelled',
            'priority' => 'in:low,medium,high,critical',
            'due_date' => 'nullable|date',
            'estimated_hours' => 'nullable|numeric|min:0',
            'tags' => 'nullable|array',
        ]);

        $data['created_by'] = auth()->id();
        $task = Task::create($data);

        return response()->json(['data' => $this->format($task->load(['assignee.user', 'creator'])), 'message' => 'Task created.'], 201);
    }

    public function show(int $id): JsonResponse
    {
        $task = Task::with([
            'assignee.user', 'assignee.avatar', 'creator',
            'milestone', 'comments.user', 'timeLogs.employee.user',
        ])->findOrFail($id);

        return response()->json(['data' => array_merge($this->format($task), [
            'description' => $task->description,
            'logged_hours' => $task->logged_hours,
            'comments' => $task->comments->map(fn ($c) => [
                'id' => $c->id,
                'comment' => $c->comment,
                'user_name' => $c->user?->name,
                'attachments' => $c->attachments ?? [],
                'created_at' => $c->created_at->diffForHumans(),
            ]),
            'time_logs' => $task->timeLogs->map(fn ($l) => [
                'id' => $l->id,
                'hours' => $l->hours,
                'date' => $l->date?->format('Y-m-d'),
                'note' => $l->note,
                'employee' => $l->employee?->user?->name,
            ]),
        ])]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $task = Task::findOrFail($id);
        $data = $request->validate([
            'title' => 'sometimes|string|max:500',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:employees,id',
            'milestone_id' => 'nullable|exists:milestones,id',
            'status' => 'in:todo,in_progress,in_review,done,cancelled',
            'priority' => 'in:low,medium,high,critical',
            'due_date' => 'nullable|date',
            'estimated_hours' => 'nullable|numeric',
            'tags' => 'nullable|array',
        ]);
        $task->update($data);

        return response()->json(['data' => $this->format($task->fresh('assignee.user')), 'message' => 'Updated.']);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate(['status' => 'required|in:todo,in_progress,in_review,done,cancelled']);
        Task::findOrFail($id)->update(['status' => $request->status]);

        return response()->json(['message' => 'Status updated.']);
    }

    public function reorder(Request $request): JsonResponse
    {
        $request->validate(['items' => 'required|array', 'items.*.id' => 'required|integer', 'items.*.sort_order' => 'required|integer']);
        foreach ($request->items as $item) {
            Task::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json(['message' => 'Reordered.']);
    }

    public function destroy(int $id): JsonResponse
    {
        Task::findOrFail($id)->delete();

        return response()->json(['message' => 'Task deleted.']);
    }

    public function addComment(Request $request, int $id): JsonResponse
    {
        $request->validate(['comment' => 'required|string|max:5000', 'attachments' => 'nullable|array']);
        $comment = TaskComment::create([
            'task_id' => $id,
            'user_id' => auth()->id(),
            'comment' => $request->comment,
            'attachments' => $request->attachments,
        ]);

        return response()->json(['data' => $comment->load('user'), 'message' => 'Comment added.'], 201);
    }

    public function logTime(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'hours' => 'required|numeric|min:0.25|max:24',
            'date' => 'required|date',
            'employee_id' => 'required|exists:employees,id',
            'note' => 'nullable|string|max:500',
        ]);
        $log = TaskTimeLog::create(['task_id' => $id] + $request->only('hours', 'date', 'employee_id', 'note'));

        return response()->json(['data' => $log, 'message' => 'Time logged.'], 201);
    }

    private function format(Task $t): array
    {
        return [
            'id' => $t->id,
            'title' => $t->title,
            'status' => $t->status,
            'priority' => $t->priority,
            'due_date' => $t->due_date?->format('Y-m-d'),
            'estimated_hours' => $t->estimated_hours,
            'tags' => $t->tags ?? [],
            'milestone' => $t->milestone?->title,
            'assigned_to_id' => $t->assigned_to,
            'assigned_to_name' => $t->assignee?->user?->name,
            'assigned_to_avatar' => $t->assignee?->avatar?->thumb_url,
            'comment_count' => $t->comments()->count(),
        ];
    }
}
