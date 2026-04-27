<?php

namespace App\Models;

use App\Notifications\CommentLiked;
use App\Notifications\IdeaLiked;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Broadcast;

class Like extends Model
{
    protected $fillable = [
        'user_id',
        'likeable_id',
        'likeable_type',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::created(function ($like) {
            $likeable = $like->likeable;

            // Only notify if the likeable model has a user relationship
            if (method_exists($likeable, 'user') && $likeable->user_id !== $like->user_id) {
                $likeable->user->notify(match (true) {
                    $likeable instanceof Idea => new IdeaLiked($likeable, $like->user),
                    $likeable instanceof Comment => new CommentLiked($likeable, $like->user),
                    default => null,
                });
            }

            // Broadcast the like event
            Broadcast::on(new PrivateChannel(
                match (true) {
                    $likeable instanceof Idea => 'idea.'.$likeable->slug,
                    $likeable instanceof Comment => 'comment.'.$likeable->id,
                    default => null,
                }
            ))->with([
                'type' => 'like_added',
                'likeable_id' => $like->likeable_id,
                'likeable_type' => $like->likeable_type,
                'user_id' => $like->user_id,
                'user_name' => $like->user->getFullName(),
            ])->as('like.added')->send();
        });

        static::deleted(function ($like) {
            $likeable = $like->likeable;

            // Broadcast the unlike event
            Broadcast::on(new PrivateChannel(
                match (true) {
                    $likeable instanceof Idea => 'idea.'.$likeable->slug,
                    $likeable instanceof Comment => 'comment.'.$likeable->id,
                    default => null,
                }
            ))->with([
                'type' => 'like_removed',
                'likeable_id' => $like->likeable_id,
                'likeable_type' => $like->likeable_type,
                'user_id' => $like->user_id,
            ])->as('like.removed')->send();
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function likeable(): MorphTo
    {
        return $this->morphTo();
    }
}
