<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Auth/EmployeeAuthController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class EmployeeAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)
            ->whereIn('role', ['employee', 'intern'])
            ->where('is_active', true)
            ->with('employee.department')
            ->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user->update(['last_login_at' => now()]);
        $user->tokens()->where('name', 'employee-token')->delete();

        $token = $user->createToken('employee-token', ['employee'])->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'avatar' => $user->avatar,
                'employee_id' => $user->employee?->id,
                'employee_code' => $user->employee?->employee_code,
                'designation' => $user->employee?->designation,
                'department' => $user->employee?->department?->name,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }
}
