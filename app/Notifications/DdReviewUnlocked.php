<?php

namespace App\Notifications;

use App\Models\DdReview;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DdReviewUnlocked extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public DdReview $ddReview,
        public User $deputyDirector
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $idea = $this->ddReview->idea;

        return (new MailMessage)
            ->subject('Idea Unlocked for Review')
            ->greeting('Hello '.$notifiable->getFullName().'!')
            ->line('An idea has been unlocked for review by '.$this->deputyDirector->getFullName().'.')
            ->line('Title: '.$idea->idea_title)
            ->line('Review Deadline: '.$this->ddReview->review_deadline->format('F j, Y g:i A'))
            ->action('View Idea', route('idea.show', $idea->slug))
            ->line('Please submit your review comments before the deadline.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Idea Unlocked for Review',
            'message' => 'The idea "'.$this->ddReview->idea->idea_title.'" is now open for review. Deadline: '.$this->ddReview->review_deadline->format('F j, Y'),
            'idea_id' => $this->ddReview->idea_id,
            'url' => route('idea.show', $this->ddReview->idea->slug),
        ];
    }
}
