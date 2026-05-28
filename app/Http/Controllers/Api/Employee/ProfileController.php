<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Employee/ProfileController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Employee;

use App\Http\Controllers\Controller;
use App\Services\ImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    private function employee(Request $request)
    {
        return $request->user()->employee;
    }

    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = $user->employee()->with(['department', 'avatar'])->first();

        return response()->json(['data' => [
            'id' => $employee?->id,
            'employee_code' => $employee?->employee_code,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'avatar_url' => $employee?->avatar?->url,
            'designation' => $employee?->designation,
            'department' => $employee?->department?->name,
            'employment_type' => $employee?->employment_type,
            'join_date' => $employee?->join_date?->format('Y-m-d'),
            'phone' => $employee?->phone,
            'address' => $employee?->address,
            'bio' => $employee?->bio,
            'skills' => $employee?->skills ?? [],
            'linkedin_url' => $employee?->linkedin_url,
            'github_url' => $employee?->github_url,
        ]]);
    }

    public function update(Request $request): JsonResponse
    {
        $employee = $this->employee($request);
        abort_unless($employee, 404, 'Employee record not found.');

        $data = $request->validate([
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'bio' => 'nullable|string|max:1000',
            'skills' => 'nullable|array',
            'linkedin_url' => 'nullable|url',
            'github_url' => 'nullable|url',
        ]);

        // Also allow updating own name
        if ($request->filled('name')) {
            $request->user()->update(['name' => $request->validate(['name' => 'string|max:255'])['name']]);
        }

        $employee->update($data);

        return response()->json(['message' => 'Profile updated.']);
    }

    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate(['image' => 'required|image|max:3072']);
        $employee = $this->employee($request);
        abort_unless($employee, 404);
        $media = app(ImageService::class)->upload($request->file('image'), 'avatars');
        $employee->update(['avatar_id' => $media->id]);
        $request->user()->update(['avatar' => $media->url]);

        return response()->json(['avatar_url' => $media->url, 'message' => 'Avatar updated.']);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();
        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $user->update(['password' => Hash::make($request->new_password)]);
        // Revoke all other tokens
        $user->tokens()->where('id', '!=', $request->user()->currentAccessToken()->id)->delete();

        return response()->json(['message' => 'Password changed. Please log in again on other devices.']);
    }
}
