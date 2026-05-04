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
        return ['mail', 'database', 'broadcast'];
    }

    public function toBroadcast(object $notifiable): array
    {
        $idea = $this->collaborationRequest->idea;

        return [
            'channel' => 'user.'.$notifiable->id,
            'event' => 'CollaborationRequestReceived',
            'data' => [
                'type' => 'collaboration_request_received',
                'idea_id' => $idea->id,
                'idea_slug' => $idea->slug,
                'idea_title' => $idea->idea_title,
                'user_name' => $this->requester->name,
                'message' => 'New collaboration request from '.$this->requester->name.' for "'.$idea->idea_title.'"',
            ],
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $idea = $this->collaborationRequest->idea;

        return (new MailMessage)
            ->subject('New Collaboration Request for "'.$idea->idea_title.'"')
            ->greeting('Hello '.$notifiable->first_name.'!')
            ->line('You have received a new collaboration request for your idea: "'.$idea->idea_title.'"')
            ->line('Request from: '.$this->requester->first_name)
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
            'user_name' => $this->requester->name,
            'message' => 'New collaboration request from '.$this->requester->name.' for "'.$idea->idea_title.'"',
        ];
    }
}
