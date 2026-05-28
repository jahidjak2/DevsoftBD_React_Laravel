<?php

// ─────────────────────────────────────────────────────────────
// app/Mail/NewInquiryMail.php
// Sent to admin when a new contact form submission arrives
// ─────────────────────────────────────────────────────────────

namespace App\Mail;

use App\Models\Inquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewInquiryMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Inquiry $inquiry) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '📬 New Inquiry: '.($this->inquiry->subject ?: 'General Inquiry').' — '.$this->inquiry->name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.new-inquiry',
        );
    }
}
