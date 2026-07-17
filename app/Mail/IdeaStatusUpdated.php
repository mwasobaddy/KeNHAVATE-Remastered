<?php

namespace App\Mail;

use App\Models\Idea;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class IdeaStatusUpdated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Idea $idea,
        public string $newStatus,
        public ?string $notes = null,
    ) {}

    public function envelope(): Envelope
    {
        $statusLabels = [
            'approved' => 'Approved',
            'deferred' => 'Deferred',
            'declined' => 'Declined',
            'budget_logged' => 'Logged for Budget',
            'closed' => 'Closed',
            'in_progress' => 'In Progress',
            'completed' => 'Completed',
            'implemented' => 'Implemented',
            'revision_requested' => 'Revision Requested',
            'resubmitted' => 'Resubmitted',
        ];

        $label = $statusLabels[$this->newStatus] ?? ucfirst($this->newStatus);

        return new Envelope(
            subject: "Idea '{$this->idea->title}' — {$label}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.idea-status-updated',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
