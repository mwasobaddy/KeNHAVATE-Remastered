<?php

namespace App\Mail;

use App\Models\Idea;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewIdeaSubmittedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Idea $idea,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "New idea submitted: {$this->idea->title}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.new-idea-submitted',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
