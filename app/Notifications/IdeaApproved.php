<?php

namespace App\Notifications;

use App\Models\DdReview;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class IdeaApproved extends Notification implements ShouldQueue
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
            ->subject('Your Idea Has Been Approved!')
            ->greeting('Congratulations '.$notifiable->getFullName().'!')
            ->line('Your idea has been approved by the Deputy Director.')
            ->line('Idea: '.$idea->idea_title)
            ->line('Review Comments:')
            ->line($this->ddReview->review_comments ?: 'No additional comments.')
            ->action('View Idea', route('idea.show', $idea->slug))
            ->line('Thank you for your contribution!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Idea Approved',
            'message' => 'Your idea "'.$this->ddReview->idea->idea_title.'" has been approved!',
            'idea_id' => $this->ddReview->idea_id,
            'url' => route('idea.show', $this->ddReview->idea->slug),
        ];
    }
}
