<?php

namespace App\Mail\Support;

use App\Models\BugReport;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BugReportSubmittedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public BugReport $report,
        public User $reporter,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Bug Report Submitted',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.support.bug-report-submitted',
        );
    }
}
