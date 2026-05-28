<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Middleware/AdminMiddleware.php
// Checks that the authenticated user has admin-level role
// AND that their Sanctum token has the 'admin' ability
// ─────────────────────────────────────────────────────────────

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Check Sanctum token ability
        if (! $user->tokenCan('admin')) {
            return response()->json(['message' => 'This token does not have admin access.'], 403);
        }

        // Check user role
        if (! in_array($user->role, ['super_admin', 'admin', 'manager'])) {
            return response()->json(['message' => 'Access denied. Insufficient role.'], 403);
        }

        // Check account is active
        if (! $user->is_active) {
            return response()->json(['message' => 'Your account has been deactivated.'], 403);
        }

        return $next($request);
    }
}
