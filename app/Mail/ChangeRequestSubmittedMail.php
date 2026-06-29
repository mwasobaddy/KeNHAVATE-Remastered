<?php

namespace App\Mail;

use App\Models\ChangeRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ChangeRequestSubmittedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public ChangeRequest $changeRequest,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Change request submitted for: {$this->changeRequest->idea->title}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.change-request-submitted',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
