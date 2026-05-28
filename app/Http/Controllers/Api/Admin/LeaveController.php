<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Admin/LeaveController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeaveController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $leaves = LeaveRequest::with(['employee.user', 'leaveType', 'approver'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->when($request->filled('employee_id'), fn ($q) => $q->where('employee_id', $request->employee_id))
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json(['data' => $leaves]);
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $leave = LeaveRequest::where('status', 'pending')->findOrFail($id);

        return DB::transaction(function () use ($leave, $request) {
            $leave->update([
                'status' => 'approved',
                'approved_by' => auth()->id(),
                'admin_note' => $request->note,
                'responded_at' => now(),
            ]);

            // Deduct from leave balance
            LeaveBalance::where('employee_id', $leave->employee_id)
                ->where('leave_type_id', $leave->leave_type_id)
                ->where('year', $leave->start_date->year)
                ->increment('used_days', $leave->days_count);

            return response()->json(['message' => 'Leave approved.']);
        });
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $leave = LeaveRequest::where('status', 'pending')->findOrFail($id);
        $leave->update([
            'status' => 'rejected',
            'approved_by' => auth()->id(),
            'admin_note' => $request->validate(['note' => 'required|string'])['note'],
            'responded_at' => now(),
        ]);

        return response()->json(['message' => 'Leave rejected.']);
    }

    public function calendar(Request $request): JsonResponse
    {
        $request->validate(['start' => 'required|date', 'end' => 'required|date']);

        $leaves = LeaveRequest::with(['employee.user', 'leaveType'])
            ->where('status', 'approved')
            ->where('start_date', '<=', $request->end)
            ->where('end_date', '>=', $request->start)
            ->get()
            ->map(fn ($l) => [
                'employee_name' => $l->employee?->user?->name,
                'leave_type' => $l->leaveType?->name,
                'color' => $l->leaveType?->color,
                'start' => $l->start_date->format('Y-m-d'),
                'end' => $l->end_date->format('Y-m-d'),
                'days' => $l->days_count,
            ]);

        return response()->json(['data' => $leaves]);
    }
}
