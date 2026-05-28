<?php

// ─────────────────────────────────────────────────────────────
// config/cors.php
// ─────────────────────────────────────────────────────────────
return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    | Allows the React frontend (different origin) to talk to this API.
    | In development: localhost:5173 (Vite) is the frontend.
    | In production: devsoftbd.com
    */
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:3000')),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Must be true for Sanctum cookie-based auth (SPA mode)
    // Can be false if using Bearer token auth only (recommended for this setup)
    'supports_credentials' => false,
];
