<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Public/ContactController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Mail\InquiryAutoReplyMail;
use App\Mail\NewInquiryMail;
use App\Models\Inquiry;
use App\Services\SettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        // Rate limit: 5 submissions per IP per hour
        $key = 'contact-form:'.$request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            return response()->json(['message' => 'Too many requests. Please try again later.'], 429);
        }
        RateLimiter::hit($key, 3600);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'company' => 'nullable|string|max:255',
            'subject' => 'nullable|string|max:500',
            'message' => 'required|string|min:10|max:5000',
            'service_interest' => 'nullable|string|max:200',
            'budget_range' => 'nullable|string|max:100',
        ]);

        $inquiry = Inquiry::create(array_merge($validated, [
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]));

        // Notify admin
        $adminEmail = SettingService::get('email_primary', config('mail.from.address'));
        try {
            Mail::to($adminEmail)->queue(new NewInquiryMail($inquiry));
            Mail::to($inquiry->email)->queue(new InquiryAutoReplyMail($inquiry));
        } catch (\Exception $e) {
            // Don't fail the request if mail fails
            \Log::error('Inquiry mail failed: '.$e->getMessage());
        }

        return response()->json([
            'message' => 'Thank you! We will get back to you within 24 hours.',
            'id' => $inquiry->id,
        ], 201);
    }
}
