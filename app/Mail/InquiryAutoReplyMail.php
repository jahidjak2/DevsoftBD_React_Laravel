<?php

// ─────────────────────────────────────────────────────────────
// app/Mail/InquiryAutoReplyMail.php
// Auto-reply sent to the person who submitted the form
// ─────────────────────────────────────────────────────────────

namespace App\Mail;

use App\Models\Inquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InquiryAutoReplyMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Inquiry $inquiry) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Thank you for contacting DevSoft BD — We\'ll be in touch soon!',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.inquiry-autoreply',
        );
    }
}
