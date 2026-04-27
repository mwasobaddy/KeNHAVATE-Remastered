<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommentRequest;
use App\Models\Comment;
use App\Models\Idea;
use Illuminate\Http\JsonResponse;

class CommentController extends Controller
{
    /**
     * Show comments for an idea.
     */
    public function index(Idea $idea)
    {
        $comments = $idea->comments()
            ->with('user', 'likes')
            ->whereNull('parent_id')
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
    public function store(StoreCommentRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['user_id'] = $request->user()->id;

        $comment = Comment::create($validated);

        // Load the comment with user and likes
        $comment->load('user', 'likes', 'idea');

        return response()->json([
            'comment' => $comment,
            'comments_count' => $comment->idea->comments()->count(),
        ]);
    }
}
