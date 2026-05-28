<?php

// bootstrap/app.php
// Laravel 11 uses this file instead of Kernel.php

use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\EmployeeMiddleware;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Register custom middleware aliases
        $middleware->alias([
            'admin' => AdminMiddleware::class,
            'employee' => EmployeeMiddleware::class,
        ]);

        // Sanctum stateful middleware for SPA
        $middleware->statefulApi();

        // Trust all proxies (for deployments behind Nginx/load balancer)
        $middleware->trustProxies(at: '*');
    })
    ->withExceptions(function (Exceptions $exceptions) {

        // Always return JSON for API routes
        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {

                // 401 — Not authenticated
                if ($e instanceof AuthenticationException) {
                    return response()->json([
                        'message' => 'Unauthenticated. Please log in.',
                    ], 401);
                }

                // 422 — Validation failed
                if ($e instanceof ValidationException) {
                    return response()->json([
                        'message' => 'Validation failed.',
                        'errors' => $e->errors(),
                    ], 422);
                }

                // 404 — Model not found
                if ($e instanceof ModelNotFoundException) {
                    $model = class_basename($e->getModel());

                    return response()->json([
                        'message' => "{$model} not found.",
                    ], 404);
                }

                // 403 — Authorization failed
                if ($e instanceof AuthorizationException) {
                    return response()->json([
                        'message' => 'You do not have permission to perform this action.',
                    ], 403);
                }

                // 405 — Method not allowed
                if ($e instanceof MethodNotAllowedHttpException) {
                    return response()->json([
                        'message' => 'HTTP method not allowed.',
                    ], 405);
                }

                // Generic HTTP exceptions
                if ($e instanceof HttpException) {
                    return response()->json([
                        'message' => $e->getMessage() ?: 'An error occurred.',
                    ], $e->getStatusCode());
                }

                // 500 — Unhandled exception (hide details in production)
                return response()->json([
                    'message' => app()->isProduction()
                        ? 'Internal server error. Please try again later.'
                        : $e->getMessage(),
                    'trace' => app()->isProduction() ? null : collect($e->getTrace())->take(5),
                ], 500);
            }
        });
    })
    ->create();
