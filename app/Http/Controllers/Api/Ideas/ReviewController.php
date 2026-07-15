<?php

namespace App\Http\Controllers\Api\Ideas;

use App\Http\Controllers\Controller;
use App\Models\CollaborationRequest;
use App\Models\IdeaClassification;
use App\Models\User;
use App\Services\Ideas\Decisions\DecisionService;
use App\Services\Ideas\IdeaCategoryService;
use App\Services\Ideas\IdeaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function __construct(
        private IdeaService $ideaService,
        private IdeaCategoryService $ideaCategoryService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = [];

        if ($user->can('idea.assign_officer')) {
            $data['pending_assignment'] = $this->ideaService->getPendingAssignment();
        }

        if ($user->can('idea.classify')) {
            $data['my_assignments'] = $this->ideaService->getMyAssignments($user);
        }

        if ($user->can('idea.record_decision')) {
            $data['pending_decisions'] = $this->ideaService->getPendingDecisions();
        }

        return response()->json($data);
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            return response()->json(['message' => 'Idea not found.'], 404);
        }

        $idea->load(['ipRight.documents', 'assignedOfficer', 'invitations', 'reviews.reviewer']);

        $user = $request->user();

        $canAssign = $user->can('idea.assign_officer');
        $canClassify = $user->can('idea.classify') && $idea->classification_id === null
            && in_array($idea->status, ['assigned', 'resubmitted']);
        $notClassified = $idea->classification_id === null && in_array($idea->status, ['assigned', 'resubmitted']);
        $canRecordDecision = $user->can('idea.record_decision')
            && DecisionService::canDecide($idea);
        $validDecisions = $user->can('idea.record_decision')
            ? DecisionService::getValidDecisions($idea)
            : [];
        $canProgress = $user->can('idea.record_decision')
            && DecisionService::canProgress($idea);
        $canRequestRevision = $user->can('idea.record_decision')
            && $idea->canBeRevised();

        $canProposeChanges = $idea->userCan($user, 'idea.propose_changes');
        $canApproveChanges = $idea->userCan($user, 'idea.approve_changes');

        $hasPendingCollaborationCount = CollaborationRequest::where('idea_id', $idea->id)
            ->where('status', 'pending')
            ->count();

        return response()->json([
            'idea' => $idea,
            'can_assign' => $canAssign,
            'can_classify' => $canClassify,
            'classifications' => $canClassify
                ? IdeaClassification::orderBy('name')->get()
                : [],
            'categories' => $notClassified
                ? $this->ideaCategoryService->getAll()
                : [],
            'officers' => $canAssign && ! $idea->assigned_officer_id
                ? User::select('id', 'name', 'email')->orderBy('name')->get()
                : [],
            'can_record_decision' => $canRecordDecision,
            'valid_decisions' => $validDecisions,
            'can_progress' => $canProgress,
            'can_request_revision' => $canRequestRevision,
            'can_propose_changes' => $canProposeChanges,
            'can_approve_changes' => $canApproveChanges,
            'has_pending_collaboration_count' => $hasPendingCollaborationCount,
        ]);
    }
}
