<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommentRequest;
use App\Models\Comment;
use App\Models\Idea;

class CommentController extends Controller
{
    /**
     * Show comments for an idea.
     */
    public function index(Idea $idea)
    {
        $userId = auth()->id();

        $comments = $idea->comments()
            ->with('user')
            ->whereNull('parent_id')
            ->withCount('likes')
            ->withExists(['likes as user_has_liked' => function ($query) use ($userId) {
                $query->where('user_id', $userId);
            }])
            ->with(['replies' => function ($query) use ($userId) {
                $query->with('user')
                    ->withCount('likes')
                    ->withExists(['likes as user_has_liked' => function ($q) use ($userId) {
                        $q->where('user_id', $userId);
                    }])
                    ->orderBy('created_at', 'asc');
            }])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return inertia('idea/comments/show', [
            'idea' => $idea,
            'comments' => $comments,
        ]);
    }

    /**
     * Store a new comment or reply.
     */
    public function store(StoreCommentRequest $request)
    {
        $validated = $request->validated();
        $validated['user_id'] = $request->user()->id;

        $comment = Comment::create($validated);

        $comment->load(['user', 'likes']);

        $userId = auth()->id();

        return response()->json([
            'success' => 'Comment posted successfully!',
            'comment' => [
                'id' => $comment->id,
                'content' => $comment->content,
                'created_at' => $comment->created_at->toISOString(),
                'parent_id' => $comment->parent_id,
                'user' => $comment->user,
                'likes_count' => $comment->likes()->count(),
                'user_has_liked' => false,
                'replies' => [],
            ],
        ]);
    }
}
