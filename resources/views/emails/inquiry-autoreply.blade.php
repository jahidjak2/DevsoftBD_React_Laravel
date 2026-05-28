 
{{-- ============================================================ --}}
{{-- resources/views/emails/inquiry-autoreply.blade.php --}}
{{-- Auto-reply to the person who submitted the form --}}
{{-- ============================================================ --}}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank you — DevSoft BD</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f4f5; color: #18181b; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.1); }
    .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 36px 32px; text-align: center; }
    .header h1 { color: #fff; font-size: 24px; font-weight: 700; }
    .header p { color: #bfdbfe; margin-top: 8px; font-size: 14px; }
    .body { padding: 36px 32px; }
    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
    .text { font-size: 15px; line-height: 1.7; color: #374151; margin-bottom: 16px; }
    .summary { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 18px 20px; margin: 24px 0; }
    .summary-title { font-size: 13px; font-weight: 600; color: #0369a1; margin-bottom: 10px; }
    .summary-row { display: flex; gap: 12px; margin-bottom: 6px; font-size: 14px; }
    .summary-label { color: #6b7280; min-width: 80px; flex-shrink: 0; }
    .summary-value { color: #111827; font-weight: 500; }
    .promise-list { list-style: none; padding: 0; margin: 16px 0; }
    .promise-list li { display: flex; align-items: flex-start; gap: 10px; padding: 6px 0; font-size: 14px; color: #374151; }
    .promise-list li::before { content: '✓'; color: #16a34a; font-weight: 700; flex-shrink: 0; }
    .contact-strip { background: #f8fafc; border-radius: 8px; padding: 16px 20px; margin: 24px 0; font-size: 14px; color: #6b7280; }
    .contact-strip strong { color: #18181b; }
    .btn-wrap { text-align: center; margin: 28px 0 12px; }
    .btn { display: inline-block; padding: 12px 28px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; }
    .footer { background: #f8fafc; padding: 20px 32px; text-align: center; font-size: 12px; color: #a1a1aa; border-top: 1px solid #e5e7eb; }
    .footer a { color: #6b7280; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>DevSoft BD</h1>
      <p>Professional Software Development Company</p>
    </div>
    <div class="body">
      <p class="greeting">Hello {{ $inquiry->name }}, 👋</p>
 
      <p class="text">
        Thank you for reaching out to DevSoft BD! We've received your message and our team will review it shortly.
        You can expect to hear from us within <strong>24 business hours</strong>.
      </p>
 
      <div class="summary">
        <div class="summary-title">📋 YOUR INQUIRY SUMMARY</div>
        @if($inquiry->subject)
        <div class="summary-row">
          <span class="summary-label">Subject:</span>
          <span class="summary-value">{{ $inquiry->subject }}</span>
        </div>
        @endif
        @if($inquiry->service_interest)
        <div class="summary-row">
          <span class="summary-label">Service:</span>
          <span class="summary-value">{{ $inquiry->service_interest }}</span>
        </div>
        @endif
        @if($inquiry->budget_range)
        <div class="summary-row">
          <span class="summary-label">Budget:</span>
          <span class="summary-value">{{ $inquiry->budget_range }}</span>
        </div>
        @endif
        <div class="summary-row">
          <span class="summary-label">Submitted:</span>
          <span class="summary-value">{{ $inquiry->created_at->setTimezone('Asia/Dhaka')->format('D, d M Y g:i A') }}</span>
        </div>
      </div>
 
      <p class="text">Here's what happens next:</p>
      <ul class="promise-list">
        <li>Our team will review your requirements carefully</li>
        <li>A specialist will reach out to discuss your project in detail</li>
        <li>We'll provide a tailored proposal and timeline</li>
        <li>No hidden fees — full transparency from day one</li>
      </ul>
 
      <div class="contact-strip">
        <strong>Need urgent assistance?</strong><br>
        Call us: <strong>+8801571244650</strong> or <strong>+8801616401375</strong><br>
        Email: <strong>info@devsoftbd.com</strong>
      </div>
 
      <div class="btn-wrap">
        <a href="https://www.devsoftbd.com/projects" class="btn">View Our Portfolio →</a>
      </div>
    </div>
    <div class="footer">
      © {{ date('Y') }} DevSoft BD · Gazipur, Dhaka, Bangladesh<br>
      <a href="https://www.devsoftbd.com">www.devsoftbd.com</a> ·
      <a href="https://www.devsoftbd.com/privacy">Privacy Policy</a>
    </div>
  </div>
</body>
</html>
 