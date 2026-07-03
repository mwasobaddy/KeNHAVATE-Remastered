<?php

namespace App\Mail;

use App\Models\Idea;
use App\Models\IdeaClassification;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class IdeaClassifiedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Idea $idea,
        public IdeaClassification $classification,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Your idea '{$this->idea->title}' has been classified",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.idea-classified',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
