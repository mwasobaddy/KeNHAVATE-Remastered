<?php

namespace App\Mail;

use App\Models\IdeaInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class IdeaInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public IdeaInvitation $invitation,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "You've been invited to contribute on KeNHAVATE",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.idea-invitation',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
