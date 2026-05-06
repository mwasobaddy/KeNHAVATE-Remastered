<?php

namespace App\Notifications;

use App\Models\DdReview;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DdCompilationSubmitted extends Notification
{
    use Queueable;

    public function __construct(
        public DdReview $ddReview,
        public User $deputyDirector
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('SME Feedback Compilation Ready - '.$this->ddReview->idea->idea_title)
            ->greeting('Hello '.$notifiable->first_name.',')
            ->line('The Deputy Director has compiled the SME feedback for your idea.')
            ->line('**Idea:** '.$this->ddReview->idea->idea_title)
            ->line('**Compiled by:** '.$this->deputyDirector->getFullName())
            ->action('View Compilation', url('/idea/dd-review/pending-sme-compilation/'.$this->ddReview->idea->slug))
            ->line('Please review the compiled feedback and proceed accordingly.')
            ->line('Thank you for your patience.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'SME Feedback Compilation Ready',
            'message' => 'The Deputy Director has compiled SME feedback for: '.$this->ddReview->idea->idea_title,
            'idea_id' => $this->ddReview->idea_id,
            'idea_title' => $this->ddReview->idea->idea_title,
            'url' => '/idea/dd-review/pending-sme-compilation/'.$this->ddReview->idea->slug,
        ];
    }
}
