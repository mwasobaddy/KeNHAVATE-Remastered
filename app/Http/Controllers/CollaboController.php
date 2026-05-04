<?php

namespace App\Http\Controllers;

use App\Models\CollaborationRequest;
use App\Models\Idea;
use App\Models\TeamMember;
use App\Notifications\CollaborationRequestApproved;
use App\Notifications\CollaborationRequestReceived;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

        $idea->load(['user', 'teamMembers.user', 'thematicArea', 'pendingCollaborationRequests.user']);

        $isOwner = $idea->user_id === $userId;
        $isCollaborator = $isOwner || $idea->teamMembers()->where('user_id', $userId)->exists();

        abort_unless($isCollaborator || $idea->collaboration_enabled, 403);

        $idea->loadCount(['likes', 'comments']);

        $userRequest = null;
        if (! $isCollaborator && $idea->collaboration_enabled) {
            $userRequest = CollaborationRequest::where('user_id', $userId)
                ->where('idea_id', $idea->id)
                ->first();
        }

        return Inertia::render('idea/collabo/show', [
            'idea' => $idea,
            'isOwner' => $isOwner,
            'isCollaborator' => $isCollaborator,
            'userCollaborationRequest' => $userRequest,
        ]);
    }

    public function requestCollaboration(Request $request, Idea $idea): JsonResponse
    {
        $userId = auth()->id();

        abort_unless($idea->collaboration_enabled, 400);

        $existingRequest = CollaborationRequest::where('user_id', $userId)
            ->where('idea_id', $idea->id)
            ->first();

        if ($existingRequest) {
            if ($existingRequest->isApproved()) {
                return response()->json(['error' => 'You are already a collaborator'], 400);
            }
            if ($existingRequest->isPending()) {
                return response()->json(['error' => 'Request already pending'], 400);
            }
            if ($existingRequest->isDeclined()) {
                $existingRequest->update(['status' => 'pending', 'message' => $request->message]);

                $idea->user->notify(new CollaborationRequestReceived($existingRequest, auth()->user()));

                return response()->json(['success' => true, 'message' => 'Request submitted']);
            }
        }

        $collaborationRequest = CollaborationRequest::create([
            'user_id' => $userId,
            'idea_id' => $idea->id,
            'status' => 'pending',
            'message' => $request->message,
        ]);

        $idea->user->notify(new CollaborationRequestReceived($collaborationRequest, auth()->user()));

        return response()->json(['success' => true, 'message' => 'Collaboration request submitted']);
    }

    public function cancelRequest(Request $request, Idea $idea): JsonResponse
    {
        $userId = auth()->id();

        $requestModel = CollaborationRequest::where('user_id', $userId)
            ->where('idea_id', $idea->id)
            ->firstOrFail();

        $requestModel->delete();

        return response()->json(['success' => true, 'message' => 'Request cancelled']);
    }

    public function approveRequest(Request $request, Idea $idea, CollaborationRequest $collaborationRequest): JsonResponse
    {
        abort_unless($idea->user_id === auth()->id(), 403);
        abort_unless($collaborationRequest->idea_id === $idea->id, 400);

        $collaborationRequest->update(['status' => 'approved']);

        TeamMember::create([
            'idea_id' => $idea->id,
            'user_id' => $collaborationRequest->user_id,
            'name' => $collaborationRequest->user->name ?? $collaborationRequest->user->getFullNameAttribute(),
            'email' => $collaborationRequest->user->email,
            'role' => 'Collaborator',
            'permissions' => 'view',
        ]);

        $collaborationRequest->user->notify(new CollaborationRequestApproved($collaborationRequest, auth()->user()));

        return response()->json(['success' => true, 'message' => 'Collaborator added']);
    }

    public function declineRequest(Idea $idea, CollaborationRequest $collaborationRequest): JsonResponse
    {
        abort_unless($idea->user_id === auth()->id(), 403);
        abort_unless($collaborationRequest->idea_id === $idea->id, 400);

        $collaborationRequest->update(['status' => 'declined']);

        return response()->json(['success' => true, 'message' => 'Request declined']);
    }

    public function removeCollaborator(Request $request, Idea $idea, TeamMember $teamMember): JsonResponse
    {
        abort_unless($idea->user_id === auth()->id(), 403);
        abort_unless($teamMember->idea_id === $idea->id, 400);

        $teamMember->delete();

        return response()->json(['success' => true, 'message' => 'Collaborator removed']);
    }
}
