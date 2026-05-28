<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Employee/LeaveRequestController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Employee;

use App\Http\Controllers\Controller;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaveRequestController extends Controller
{
    private function employee(Request $request)
    {
        $e = $request->user()->employee;
        abort_unless($e, 403);

        return $e;
    }

    public function index(Request $request): JsonResponse
    {
        $employee = $this->employee($request);
        $requests = LeaveRequest::where('employee_id', $employee->id)
            ->with(['leaveType', 'approver'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json(['data' => $requests]);
    }

    public function store(Request $request): JsonResponse
    {
        $employee = $this->employee($request);
        $data = $request->validate([
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string|min:10|max:1000',
        ]);

        $days = LeaveRequest::calculateDays($data['start_date'], $data['end_date']);

        // Check leave balance
        $balance = LeaveBalance::where('employee_id', $employee->id)
            ->where('leave_type_id', $data['leave_type_id'])
            ->where('year', date('Y', strtotime($data['start_date'])))
            ->first();

        if (! $balance || $balance->remaining_days < $days) {
            return response()->json(['message' => 'Insufficient leave balance. You have '.($balance?->remaining_days ?? 0).' days remaining.'], 422);
        }

        // Check for overlapping approved/pending requests
        $overlap = LeaveRequest::where('employee_id', $employee->id)
            ->whereIn('status', ['pending', 'approved'])
            ->where('start_date', '<=', $data['end_date'])
            ->where('end_date', '>=', $data['start_date'])
            ->exists();

        if ($overlap) {
            return response()->json(['message' => 'You already have a leave request overlapping these dates.'], 422);
        }

        $leave = LeaveRequest::create(array_merge($data, [
            'employee_id' => $employee->id,
            'days_count' => $days,
        ]));

        return response()->json([
            'data' => $leave->load('leaveType'),
            'message' => "Leave request submitted for {$days} day(s). Awaiting approval.",
        ], 201);
    }

    public function cancel(Request $request, int $id): JsonResponse
    {
        $employee = $this->employee($request);
        $leave = LeaveRequest::where('employee_id', $employee->id)
            ->where('status', 'pending')
            ->findOrFail($id);
        $leave->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Leave request cancelled.']);
    }

    public function balance(Request $request): JsonResponse
    {
        $employee = $this->employee($request);
        $year = $request->input('year', date('Y'));

        $balances = LeaveBalance::where('employee_id', $employee->id)
            ->where('year', $year)
            ->with('leaveType')
            ->get()
            ->map(fn ($b) => [
                'leave_type' => $b->leaveType?->name,
                'color' => $b->leaveType?->color,
                'is_paid' => $b->leaveType?->is_paid,
                'total_days' => $b->total_days,
                'used_days' => $b->used_days,
                'remaining_days' => $b->remaining_days,
                'year' => $b->year,
            ]);

        return response()->json(['data' => $balances, 'year' => $year]);
    }
}
