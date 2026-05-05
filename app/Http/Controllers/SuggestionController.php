<?php

namespace App\Http\Controllers;

use App\Models\Idea;
use App\Models\Suggestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SuggestionController extends Controller
{
    public function store(Request $request, Idea $idea): JsonResponse
    {
        $userId = auth()->id();

        $isCollaborator = $idea->user_id === $userId
            || $idea->collaborators()->where('user_id', $userId)->exists();

        abort_unless($isCollaborator, 403);

        $request->validate([
            'section' => 'required|string|in:abstract,problem_statement,proposed_solution,cost_benefit,general,other',
            'content' => 'required|string|min:1',
        ]);

        $suggestion = Suggestion::create([
            'idea_id' => $idea->id,
            'user_id' => $userId,
            'section' => $request->section,
            'content' => $request->content,
            'status' => 'pending',
        ]);

        return response()->json(['success' => true, 'suggestion' => $suggestion]);
    }

    public function approve(Request $request, Idea $idea, Suggestion $suggestion): JsonResponse
    {
        abort_unless($idea->user_id === auth()->id(), 403);
        abort_unless($suggestion->idea_id === $idea->id, 400);

        $suggestion->update(['status' => 'accepted']);

        return response()->json(['success' => true]);
    }

    public function decline(Request $request, Idea $idea, Suggestion $suggestion): JsonResponse
    {
        abort_unless($idea->user_id === auth()->id(), 403);
        abort_unless($suggestion->idea_id === $idea->id, 400);

        $suggestion->update(['status' => 'rejected']);

        return response()->json(['success' => true]);
    }
}
