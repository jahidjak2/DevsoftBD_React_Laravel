<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Employee/DashboardController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Employee;

use App\Http\Controllers\Controller;
use App\Models\InternalProject;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeDashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = $user->employee;
        $employeeId = $employee?->id;

        if (! $employeeId) {
            return response()->json(['message' => 'No employee record found.'], 404);
        }

        $taskStats = [
            'total' => Task::where('assigned_to', $employeeId)->whereNotIn('status', ['cancelled'])->count(),
            'in_progress' => Task::where('assigned_to', $employeeId)->where('status', 'in_progress')->count(),
            'overdue' => Task::where('assigned_to', $employeeId)
                ->whereNotIn('status', ['done', 'cancelled'])
                ->where('due_date', '<', now())
                ->count(),
        ];

        $recentTasks = Task::where('assigned_to', $employeeId)
            ->whereIn('status', ['todo', 'in_progress', 'in_review'])
            ->with('project')
            ->orderBy('due_date')
            ->limit(5)
            ->get(['id', 'title', 'status', 'priority', 'due_date', 'internal_project_id']);

        $projectCount = InternalProject::whereHas('members', fn ($q) => $q->where('employee_id', $employeeId))
            ->where('status', 'active')
            ->count();

        $leaveBalance = LeaveBalance::where('employee_id', $employeeId)
            ->where('year', date('Y'))
            ->with('leaveType')
            ->get()
            ->map(fn ($b) => ['type' => $b->leaveType?->name, 'remaining' => $b->remaining_days]);

        $pendingLeave = LeaveRequest::where('employee_id', $employeeId)
            ->where('status', 'pending')
            ->count();

        return response()->json([
            'greeting' => 'Good '.($this->timeOfDay()).', '.$user->name.'!',
            'task_stats' => $taskStats,
            'recent_tasks' => $recentTasks,
            'active_projects' => $projectCount,
            'leave_balance' => $leaveBalance,
            'pending_leave_requests' => $pendingLeave,
        ]);
    }

    private function timeOfDay(): string
    {
        $hour = now()->setTimezone('Asia/Dhaka')->hour;
        if ($hour < 12) {
            return 'morning';
        }
        if ($hour < 17) {
            return 'afternoon';
        }

        return 'evening';
    }
}
