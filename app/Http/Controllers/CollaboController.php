<?php

namespace App\Http\Controllers;

use App\Models\Idea;
use Inertia\Inertia;
use Inertia\Response;

class CollaboController extends Controller
{
    public function index(): Response
    {
        $userId = auth()->id();

        $collaborations = Idea::where('collaboration_enabled', true)
            ->where(function ($query) use ($userId) {
                $query->where('user_id', $userId)
                    ->orWhereHas('teamMembers', function ($q) use ($userId) {
                        $q->where('user_id', $userId);
                    });
            })
            ->with('user')
            ->withCount(['teamMembers', 'likes'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('idea/collabo/index', [
            'ideas' => $collaborations,
        ]);
    }

    public function show(Idea $idea): Response
    {
        $userId = auth()->id();

        $idea->load(['user', 'teamMembers.user', 'thematicArea']);

        $isCollaborator = $idea->user_id === $userId
            || $idea->teamMembers()->where('user_id', $userId)->exists();

        abort_unless($isCollaborator || $idea->collaboration_enabled, 403);

        $idea->loadCount(['likes', 'comments']);

        return Inertia::render('idea/collabo/show', [
            'idea' => $idea,
        ]);
    }
}
