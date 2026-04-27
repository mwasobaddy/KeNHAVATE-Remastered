<?php

namespace App\Notifications;

use App\Models\Idea;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class IdeaLiked extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Idea $idea,
        public User $liker,
    ) {}

    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'idea_liked',
            'idea_id' => $this->idea->id,
            'idea_title' => $this->idea->idea_title,
            'idea_slug' => $this->idea->slug,
            'user_id' => $this->liker->id,
            'user_name' => $this->liker->getFullName(),
            'message' => $this->liker->getFullName().' liked your idea "'.$this->idea->idea_title.'"',
        ];
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
