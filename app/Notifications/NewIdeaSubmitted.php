<?php

namespace App\Notifications;

use App\Models\Idea;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewIdeaSubmitted extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Idea $idea
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Idea Submitted for Review')
            ->greeting('Hello '.$notifiable->getFullName().'!')
            ->line('A new idea has been submitted and requires your review.')
            ->line('Title: '.$this->idea->idea_title)
            ->line('Submitted by: '.$this->idea->user?->getFullName())
            ->action('Review Ideas', route('idea.ddReview.dashboard'))
            ->line('Please login to the system to review the submission.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'New Idea Submitted',
            'message' => 'A new idea "'.$this->idea->idea_title.'" has been submitted for review.',
            'idea_id' => $this->idea->id,
            'url' => route('idea.ddReview.dashboard'),
        ];
    }
}
