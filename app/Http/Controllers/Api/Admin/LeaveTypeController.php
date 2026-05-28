<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Admin/LeaveTypeController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\LeaveType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaveTypeController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => LeaveType::orderBy('name')->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:100|unique:leave_types,name',
            'days_allowed' => 'required|integer|min:1',
            'is_paid' => 'boolean',
            'carry_forward' => 'boolean',
            'color' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);
        $type = LeaveType::create($data);

        return response()->json(['data' => $type, 'message' => 'Leave type created.'], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $type = LeaveType::findOrFail($id);
        $data = $request->validate([
            'name' => 'sometimes|string|max:100|unique:leave_types,name,'.$id,
            'days_allowed' => 'integer|min:1',
            'is_paid' => 'boolean',
            'carry_forward' => 'boolean',
            'color' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);
        $type->update($data);

        return response()->json(['data' => $type->fresh(), 'message' => 'Updated.']);
    }

    public function destroy(int $id): JsonResponse
    {
        LeaveType::findOrFail($id)->delete();

        return response()->json(['message' => 'Leave type deleted.']);
    }
}
