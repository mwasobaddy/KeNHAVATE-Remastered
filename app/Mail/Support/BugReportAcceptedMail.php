<?php

namespace App\Mail\Support;

use App\Models\BugReport;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BugReportAcceptedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public BugReport $report,
        public ?string $notes,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Bug Report Accepted',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.support.bug-report-accepted',
        );
    }
}
