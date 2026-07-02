<?php

namespace App\Mail;

use App\Models\CollaborationRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CollaborationApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public CollaborationRequest $collaborationRequest,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Collaboration request approved for: {$this->collaborationRequest->idea->title}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.collaboration-approved',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
