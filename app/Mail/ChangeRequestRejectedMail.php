<?php

namespace App\Mail;

use App\Models\ChangeRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ChangeRequestRejectedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public ChangeRequest $changeRequest,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Change request rejected for: {$this->changeRequest->idea->title}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.change-request-rejected',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
