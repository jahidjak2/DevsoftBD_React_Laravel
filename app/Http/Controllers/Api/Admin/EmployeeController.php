<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Admin/EmployeeController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeeDocument;
use App\Models\User;
use App\Services\ImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class EmployeeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $employees = Employee::with(['user', 'department', 'avatar'])
            ->when($request->filled('department_id'), fn ($q) => $q->where('department_id', $request->department_id)
            )
            ->when($request->filled('type'), fn ($q) => $q->where('employment_type', $request->type)
            )
            ->when($request->filled('active'), fn ($q) => $q->where('is_active', $request->boolean('active'))
            )
            ->when($request->filled('search'), fn ($q) => $q->where(fn ($sq) => $sq->where('designation', 'like', '%'.$request->search.'%')
                ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', '%'.$request->search.'%')
                )
                ->orWhere('employee_code', 'like', '%'.$request->search.'%')
            )
            )
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json(['data' => $employees->through(fn ($e) => [
            'id' => $e->id,
            'employee_code' => $e->employee_code,
            'name' => $e->user?->name,
            'email' => $e->user?->email,
            'avatar_url' => $e->avatar?->url,
            'designation' => $e->designation,
            'department' => $e->department?->name,
            'employment_type' => $e->employment_type,
            'join_date' => $e->join_date?->format('Y-m-d'),
            'is_active' => $e->is_active,
        ])]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            // User account
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'in:employee,intern',
            // Employee record
            'department_id' => 'nullable|exists:departments,id',
            'designation' => 'required|string|max:200',
            'employment_type' => 'in:full_time,part_time,contract,intern',
            'join_date' => 'required|date',
            'phone' => 'nullable|string|max:50',
            'emergency_contact_name' => 'nullable|string|max:200',
            'emergency_contact_phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'nid_number' => 'nullable|string|max:100',
            'salary' => 'nullable|numeric|min:0',
            'bank_account' => 'nullable|string|max:100',
            'bio' => 'nullable|string',
            'skills' => 'nullable|array',
            'linkedin_url' => 'nullable|url',
            'github_url' => 'nullable|url',
        ]);

        return DB::transaction(function () use ($data) {
            // Create user account
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => $data['role'] ?? 'employee',
                'is_active' => true,
            ]);

            // Create employee record
            $employeeData = collect($data)
                ->except(['name', 'email', 'password', 'role'])
                ->toArray();

            $employeeData['user_id'] = $user->id;
            $employeeData['employee_code'] = Employee::generateCode();

            $employee = Employee::create($employeeData);

            // Link user → employee
            $user->update(['employee_id' => $employee->id]);

            return response()->json([
                'data' => $employee->load(['user', 'department']),
                'message' => 'Employee created. Login: '.$data['email'],
            ], 201);
        });
    }

    public function show(int $id): JsonResponse
    {
        $employee = Employee::with([
            'user', 'department', 'avatar', 'documents.media',
        ])->findOrFail($id);

        return response()->json(['data' => [
            'id' => $employee->id,
            'employee_code' => $employee->employee_code,
            'name' => $employee->user?->name,
            'email' => $employee->user?->email,
            'role' => $employee->user?->role,
            'avatar_url' => $employee->avatar?->url,
            'department_id' => $employee->department_id,
            'department' => $employee->department?->name,
            'designation' => $employee->designation,
            'employment_type' => $employee->employment_type,
            'join_date' => $employee->join_date?->format('Y-m-d'),
            'end_date' => $employee->end_date?->format('Y-m-d'),
            'phone' => $employee->phone,
            'emergency_contact_name' => $employee->emergency_contact_name,
            'emergency_contact_phone' => $employee->emergency_contact_phone,
            'address' => $employee->address,
            'bio' => $employee->bio,
            'skills' => $employee->skills ?? [],
            'linkedin_url' => $employee->linkedin_url,
            'github_url' => $employee->github_url,
            'is_active' => $employee->is_active,
            // Sensitive — only super_admin sees these
            'salary' => auth()->user()->role === 'super_admin' ? $employee->getRawOriginal('salary') : null,
            'bank_account' => auth()->user()->role === 'super_admin' ? $employee->getRawOriginal('bank_account') : null,
            'documents' => $employee->documents->map(fn ($d) => [
                'id' => $d->id,
                'title' => $d->title,
                'document_type' => $d->document_type,
                'url' => $d->media?->url,
                'created_at' => $d->created_at->format('Y-m-d'),
            ]),
        ]]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $employee = Employee::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'department_id' => 'nullable|exists:departments,id',
            'designation' => 'sometimes|string|max:200',
            'employment_type' => 'in:full_time,part_time,contract,intern',
            'join_date' => 'sometimes|date',
            'end_date' => 'nullable|date',
            'phone' => 'nullable|string|max:50',
            'emergency_contact_name' => 'nullable|string|max:200',
            'emergency_contact_phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'bio' => 'nullable|string',
            'skills' => 'nullable|array',
            'linkedin_url' => 'nullable|url',
            'github_url' => 'nullable|url',
            'is_active' => 'boolean',
            'salary' => 'nullable|numeric',
            'bank_account' => 'nullable|string',
        ]);

        if (isset($data['name'])) {
            $employee->user?->update(['name' => $data['name']]);
            unset($data['name']);
        }

        $employee->update($data);

        return response()->json(['data' => $employee->fresh(['user', 'department']), 'message' => 'Updated.']);
    }

    public function destroy(int $id): JsonResponse
    {
        Employee::findOrFail($id)->update(['is_active' => false]);
        Employee::findOrFail($id)->delete();

        return response()->json(['message' => 'Employee deactivated.']);
    }

    public function uploadDocument(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'document' => 'required|file|max:20480', // 20MB
            'document_type' => 'required|in:nda,contract,id_card,certificate,other',
            'title' => 'required|string|max:200',
            'notes' => 'nullable|string',
        ]);

        $employee = Employee::findOrFail($id);
        $media = app(ImageService::class)->upload($request->file('document'), 'employee-docs');

        $doc = EmployeeDocument::create([
            'employee_id' => $employee->id,
            'media_id' => $media->id,
            'document_type' => $request->document_type,
            'title' => $request->title,
            'notes' => $request->notes,
            'uploaded_by' => auth()->id(),
        ]);

        return response()->json(['data' => $doc, 'message' => 'Document uploaded.'], 201);
    }
}
