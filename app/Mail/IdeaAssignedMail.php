<?php

namespace App\Mail;

use App\Models\Idea;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class IdeaAssignedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Idea $idea,
        public User $assignedBy,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Idea assigned for review: {$this->idea->title}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.idea-assigned',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
