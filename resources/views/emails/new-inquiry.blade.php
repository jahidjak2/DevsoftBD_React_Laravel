{{-- resources/views/emails/new-inquiry.blade.php --}}
{{-- Admin notification email --}}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Inquiry</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f4f5; color: #18181b; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.1); }
    .header { background: #1e40af; padding: 28px 32px; }
    .header h1 { color: #fff; font-size: 20px; font-weight: 600; }
    .header p { color: #bfdbfe; font-size: 14px; margin-top: 4px; }
    .body { padding: 32px; }
    .badge { display: inline-block; padding: 4px 12px; background: #dbeafe; color: #1e40af; border-radius: 20px; font-size: 12px; font-weight: 500; margin-bottom: 20px; }
    .field { margin-bottom: 16px; border-bottom: 1px solid #f1f1f1; padding-bottom: 16px; }
    .field:last-of-type { border-bottom: none; }
    .field-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: #71717a; margin-bottom: 4px; }
    .field-value { font-size: 15px; color: #18181b; line-height: 1.6; }
    .message-box { background: #f8fafc; border-left: 3px solid #3b82f6; padding: 14px 16px; border-radius: 0 8px 8px 0; font-size: 15px; line-height: 1.7; color: #374151; }
    .actions { margin-top: 28px; padding-top: 24px; border-top: 1px solid #f1f1f1; }
    .btn { display: inline-block; padding: 10px 22px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500; }
    .footer { background: #f8fafc; padding: 20px 32px; text-align: center; font-size: 12px; color: #a1a1aa; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>📬 New Contact Inquiry</h1>
      <p>{{ now()->setTimezone('Asia/Dhaka')->format('D, d M Y — g:i A') }} (Dhaka Time)</p>
    </div>
    <div class="body">
      <span class="badge">{{ ucfirst($inquiry->status) }}</span>
 
      <div class="field">
        <div class="field-label">Name</div>
        <div class="field-value">{{ $inquiry->name }}</div>
      </div>
 
      <div class="field">
        <div class="field-label">Email</div>
        <div class="field-value"><a href="mailto:{{ $inquiry->email }}">{{ $inquiry->email }}</a></div>
      </div>
 
      @if($inquiry->phone)
      <div class="field">
        <div class="field-label">Phone</div>
        <div class="field-value">{{ $inquiry->phone }}</div>
      </div>
      @endif
 
      @if($inquiry->company)
      <div class="field">
        <div class="field-label">Company</div>
        <div class="field-value">{{ $inquiry->company }}</div>
      </div>
      @endif
 
      @if($inquiry->service_interest)
      <div class="field">
        <div class="field-label">Service Interest</div>
        <div class="field-value">{{ $inquiry->service_interest }}</div>
      </div>
      @endif
 
      @if($inquiry->budget_range)
      <div class="field">
        <div class="field-label">Budget Range</div>
        <div class="field-value">{{ $inquiry->budget_range }}</div>
      </div>
      @endif
 
      @if($inquiry->subject)
      <div class="field">
        <div class="field-label">Subject</div>
        <div class="field-value">{{ $inquiry->subject }}</div>
      </div>
      @endif
 
      <div class="field">
        <div class="field-label">Message</div>
        <div class="message-box">{{ $inquiry->message }}</div>
      </div>
 
      <div class="actions">
        <a href="{{ env('FRONTEND_URL') }}/admin/inquiries/{{ $inquiry->id }}" class="btn">
          View in Admin Panel →
        </a>
      </div>
    </div>
    <div class="footer">
      DevSoft BD · Gazipur, Dhaka, Bangladesh · info@devsoftbd.com
    </div>
  </div>
</body>
</html>