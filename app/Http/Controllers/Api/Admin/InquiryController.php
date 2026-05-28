<?php

// ─────────────────────────────────────────────────────────────
// app/Http/Controllers/Api/Admin/InquiryController.php
// ─────────────────────────────────────────────────────────────

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class InquiryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $inquiries = Inquiry::query()
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->when($request->filled('search'), fn ($q) => $q->where(fn ($sq) => $sq->where('name', 'like', '%'.$request->search.'%')
                ->orWhere('email', 'like', '%'.$request->search.'%')
                ->orWhere('subject', 'like', '%'.$request->search.'%')
            )
            )
            ->orderBy('created_at', 'desc')
            ->paginate(25);

        return response()->json(['data' => $inquiries]);
    }

    public function show(int $id): JsonResponse
    {
        $inquiry = Inquiry::findOrFail($id);
        // Auto-mark as read when opened
        if ($inquiry->status === 'new') {
            $inquiry->update(['status' => 'read']);
        }

        return response()->json(['data' => $inquiry]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:new,read,replied,spam,archived',
            'admin_note' => 'nullable|string',
        ]);
        $inquiry = Inquiry::findOrFail($id);
        $update = ['status' => $request->status];
        if ($request->filled('admin_note')) {
            $update['admin_note'] = $request->admin_note;
        }
        if ($request->status === 'replied') {
            $update['replied_at'] = now();
        }
        $inquiry->update($update);

        return response()->json(['data' => $inquiry->fresh(), 'message' => 'Status updated.']);
    }

    public function destroy(int $id): JsonResponse
    {
        Inquiry::findOrFail($id)->delete();

        return response()->json(['message' => 'Inquiry deleted.']);
    }

    public function export(Request $request)
    {
        $inquiries = Inquiry::query()
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->orderBy('created_at', 'desc')
            ->get(['name', 'email', 'phone', 'company', 'subject', 'message', 'service_interest', 'budget_range', 'status', 'created_at']);

        $headers = ['Content-Type' => 'text/csv', 'Content-Disposition' => 'attachment; filename=inquiries.csv'];
        $callback = function () use ($inquiries) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Name', 'Email', 'Phone', 'Company', 'Subject', 'Message', 'Service Interest', 'Budget', 'Status', 'Date']);
            foreach ($inquiries as $i) {
                fputcsv($file, [
                    $i->name, $i->email, $i->phone, $i->company,
                    $i->subject, $i->message, $i->service_interest,
                    $i->budget_range, $i->status, $i->created_at,
                ]);
            }
            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }
}
