<?php

namespace App\Notifications;

use App\Models\CollaborationRequest;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CollaborationRequestApproved extends Notification
{
    use Queueable;

    public function __construct(
        public CollaborationRequest $collaborationRequest,
        public User $approver
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $idea = $this->collaborationRequest->idea;

        return (new MailMessage)
            ->subject('Collaboration Request Approved for "'.$idea->idea_title.'"')
            ->greeting('Hello '.$notifiable->getFullNameAttribute().'!')
            ->line('Great news! Your collaboration request for "'.$idea->idea_title.'" has been approved by '.$this->approver->getFullNameAttribute().'.')
            ->line('You are now a collaborator on this idea.')
            ->action('View Idea', url('/idea/'.$idea->slug.'/collabo'))
            ->line('Thank you for using our application!');
    }

    public function toArray(object $notifiable): array
    {
        $idea = $this->collaborationRequest->idea;

        return [
            'type' => 'collaboration_approved',
            'idea_id' => $idea->id,
            'idea_slug' => $idea->slug,
            'idea_title' => $idea->idea_title,
            'user_name' => $this->approver->getFullNameAttribute(),
            'message' => 'Your collaboration request for "'.$idea->idea_title.'" has been approved!',
        ];
    }
}
