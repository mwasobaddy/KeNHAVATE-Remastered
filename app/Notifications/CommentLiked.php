<?php

namespace App\Notifications;

use App\Models\Comment;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class CommentLiked extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Comment $comment,
        public User $liker,
    ) {}

    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'comment_liked',
            'comment_id' => $this->comment->id,
            'comment_content' => substr($this->comment->content, 0, 100),
            'idea_id' => $this->comment->idea_id,
            'idea_slug' => $this->comment->idea?->slug,
            'user_id' => $this->liker->id,
            'user_name' => $this->liker->getFullName(),
            'message' => $this->liker->getFullName().' liked your comment on "'.$this->comment->idea?->idea_title.'"',
        ];
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
