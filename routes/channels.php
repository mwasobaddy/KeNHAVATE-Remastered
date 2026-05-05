<?php

use App\Models\Comment;
use App\Models\Idea;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Idea channel for real-time updates (comments, likes, etc.)
Broadcast::channel('idea.{ideaSlug}', function ($user, $ideaSlug) {
    $idea = Idea::where('slug', $ideaSlug)->first();

    if (! $idea) {
        return false;
    }

    // Allow if user is the owner, a team member, or if collaboration is enabled
    if ($idea->collaboration_enabled) {
        return true;
    }

    if ($idea->user_id === $user->id) {
        return true;
    }

    // Check if user is a collaborator
    return $idea->collaborators()->where('user_id', $user->id)->exists();
});

// Comment channel for nested replies
Broadcast::channel('comment.{commentId}', function ($user, $commentId) {
    $comment = Comment::with('idea')->find($commentId);

    if (! $comment || ! $comment->idea) {
        return false;
    }

    $idea = $comment->idea;

    // Same logic as idea channel
    if ($idea->collaboration_enabled) {
        return true;
    }

    if ($idea->user_id === $user->id) {
        return true;
    }

    return $idea->collaborators()->where('user_id', $user->id)->exists();
});
