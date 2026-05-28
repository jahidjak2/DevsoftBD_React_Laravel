<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Middleware/EmployeeMiddleware.php
// Checks that the authenticated user has employee-level role
// AND that their Sanctum token has the 'employee' ability
// ─────────────────────────────────────────────────────────────

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EmployeeMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Check Sanctum token ability
        if (! $user->tokenCan('employee')) {
            return response()->json(['message' => 'This token does not have employee access.'], 403);
        }

        // Check user role
        if (! in_array($user->role, ['employee', 'intern'])) {
            return response()->json(['message' => 'Access denied. Not an employee account.'], 403);
        }

        // Check account is active
        if (! $user->is_active) {
            return response()->json(['message' => 'Your account has been deactivated. Contact HR.'], 403);
        }

        return $next($request);
    }
}
