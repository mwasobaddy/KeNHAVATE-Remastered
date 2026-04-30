<?php

namespace App\Models;

use App\Notifications\CommentPosted;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Facades\Broadcast;

class Comment extends Model
{
    protected $fillable = [
        'idea_id',
        'user_id',
        'parent_id',
        'content',
        'is_internal',
    ];

    protected $casts = [
        'is_internal' => 'boolean',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::created(function ($comment) {
            $idea = $comment->idea;

            // Notify idea owner if commenter is not the owner
            if ($idea->user_id !== $comment->user_id) {
                $idea->user->notify(new CommentPosted($comment, $comment->user));
            }

            // If this is a reply, notify the parent comment owner
            if ($comment->parent_id && $comment->parent->user_id !== $comment->user_id) {
                $comment->parent->user->notify(new CommentPosted($comment, $comment->user));
            }

            // Broadcast the comment event
            Broadcast::on(new PrivateChannel('idea.'.$idea->slug))
                ->with([
                    'type' => 'comment_added',
                    'comment_id' => $comment->id,
                    'user_id' => $comment->user_id,
                    'user_name' => $comment->user->getFullName(),
                    'content' => substr($comment->content, 0, 100),
                    'parent_id' => $comment->parent_id,
                ])->as('comment.added')->send();
        });

        static::deleted(function ($comment) {
            $idea = $comment->idea;

            // Broadcast the comment deleted event
            Broadcast::on(new PrivateChannel('idea.'.$idea->slug))
                ->with([
                    'type' => 'comment_removed',
                    'comment_id' => $comment->id,
                    'parent_id' => $comment->parent_id,
                ])->as('comment.removed')->send();
        });
    }

    public function idea(): BelongsTo
    {
        return $this->belongsTo(Idea::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(Comment::class, 'parent_id');
    }

    public function likes(): MorphMany
    {
        return $this->morphMany(Like::class, 'likeable');
    }
}
