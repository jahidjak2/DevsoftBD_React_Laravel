<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Admin/DepartmentController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index(): JsonResponse
    {
        $depts = Department::withCount('employees')->with('head.user')->orderBy('name')->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'name' => $d->name,
                'description' => $d->description,
                'head' => $d->head?->user?->name,
                'head_employee_id' => $d->head_employee_id,
                'employees_count' => $d->employees_count,
                'is_active' => $d->is_active,
            ]);

        return response()->json(['data' => $depts]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:200|unique:departments,name',
            'description' => 'nullable|string',
            'head_employee_id' => 'nullable|exists:employees,id',
            'is_active' => 'boolean',
        ]);
        $dept = Department::create($data);

        return response()->json(['data' => $dept, 'message' => 'Department created.'], 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(['data' => Department::with(['head.user', 'employees.user'])->withCount('employees')->findOrFail($id)]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $dept = Department::findOrFail($id);
        $data = $request->validate([
            'name' => 'sometimes|string|max:200|unique:departments,name,'.$id,
            'description' => 'nullable|string',
            'head_employee_id' => 'nullable|exists:employees,id',
            'is_active' => 'boolean',
        ]);
        $dept->update($data);

        return response()->json(['data' => $dept->fresh(), 'message' => 'Updated.']);
    }

    public function destroy(int $id): JsonResponse
    {
        $dept = Department::withCount('employees')->findOrFail($id);
        if ($dept->employees_count > 0) {
            return response()->json(['message' => 'Cannot delete a department with active employees. Reassign them first.'], 422);
        }
        $dept->delete();

        return response()->json(['message' => 'Department deleted.']);
    }
}
