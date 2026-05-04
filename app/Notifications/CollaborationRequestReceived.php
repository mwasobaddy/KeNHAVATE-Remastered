<?php

namespace App\Notifications;

use App\Models\CollaborationRequest;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CollaborationRequestReceived extends Notification
{
    use Queueable;

    public function __construct(
        public CollaborationRequest $collaborationRequest,
        public User $requester
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $idea = $this->collaborationRequest->idea;

        return (new MailMessage)
            ->subject('New Collaboration Request for "'.$idea->idea_title.'"')
            ->greeting('Hello '.$notifiable->getFullNameAttribute().'!')
            ->line('You have received a new collaboration request for your idea: "'.$idea->idea_title.'"')
            ->line('Request from: '.$this->requester->getFullNameAttribute())
            ->line($this->collaborationRequest->message ? 'Message: '.$this->collaborationRequest->message : 'No message included.')
            ->action('View Requests', url('/idea/'.$idea->slug.'/collabo'))
            ->line('Thank you for using our application!');
    }

    public function toArray(object $notifiable): array
    {
        $idea = $this->collaborationRequest->idea;

        return [
            'type' => 'collaboration_request_received',
            'idea_id' => $idea->id,
            'idea_slug' => $idea->slug,
            'idea_title' => $idea->idea_title,
            'user_name' => $this->requester->getFullNameAttribute(),
            'message' => 'New collaboration request from '.$this->requester->getFullNameAttribute().' for "'.$idea->idea_title.'"',
        ];
    }
}
