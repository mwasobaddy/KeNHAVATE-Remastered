<?php

namespace App\Notifications;

use App\Models\DdReview;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FeedbackSent extends Notification implements ShouldQueue
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
            ->subject('Feedback Received for Your Idea')
            ->greeting('Hello '.$notifiable->getFullName().'!')
            ->line('You have received feedback on your idea from the Deputy Director.')
            ->line('Idea: '.$idea->idea_title)
            ->line('Feedback:')
            ->line($this->ddReview->feedback)
            ->action('View Idea', route('idea.show', $idea->slug))
            ->line('Thank you for your submission.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Feedback Received',
            'message' => 'You have received feedback on your idea "'.$this->ddReview->idea->idea_title.'".',
            'idea_id' => $this->ddReview->idea_id,
            'url' => route('idea.show', $this->ddReview->idea->slug),
        ];
    }
}
