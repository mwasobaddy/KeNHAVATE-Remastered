<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Idea;
use App\Services\CommentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CommentController extends Controller
{
    public function __construct(
        private CommentService $commentService
    ) {}

    public function index(Idea $idea): Response
    {
        $comments = $this->commentService->getForIdea(
            $idea->id,
            request()->only(['is_internal'])
        );

        return Inertia::render('idea/comments/index', [
            'idea' => $idea->load('user'),
            'comments' => $comments,
        ]);
    }

    public function store(Request $request, Idea $idea): RedirectResponse
    {
        $validated = $request->validate([
            'content' => ['required', 'string', 'min:3'],
            'parent_id' => ['nullable', 'exists:comments,id'],
            'is_internal' => ['boolean'],
        ]);

        $validated['idea_id'] = $idea->id;
        $validated['user_id'] = auth()->id();

        try {
            $this->commentService->create($validated);

            return back()->with('success', 'Comment added successfully!');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to add comment.']);
        }
    }

    public function destroy(Comment $comment): RedirectResponse
    {
        try {
            $this->commentService->delete($comment);

            return back()->with('success', 'Comment deleted successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete comment.']);
        }
    }
}
