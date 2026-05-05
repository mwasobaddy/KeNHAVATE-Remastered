<?php

namespace App\Notifications;

use App\Models\DdReview;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class IdeaRejected extends Notification implements ShouldQueue
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
            ->subject('Your Idea Has Been Rejected')
            ->greeting('Hello '.$notifiable->getFullName().'!')
            ->line('Your idea has been reviewed but not approved at this time.')
            ->line('Idea: '.$idea->idea_title)
            ->line('Feedback:')
            ->line($this->ddReview->feedback ?: $this->ddReview->review_comments ?: 'No additional feedback provided.')
            ->action('View Idea', route('idea.show', $idea->slug))
            ->line('Please review the feedback and consider revising your idea.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Idea Rejected',
            'message' => 'Your idea "'.$this->ddReview->idea->idea_title.'" was not approved. Please check the feedback.',
            'idea_id' => $this->ddReview->idea_id,
            'url' => route('idea.show', $this->ddReview->idea->slug),
        ];
    }
}
