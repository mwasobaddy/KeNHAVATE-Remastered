<?php

namespace App\Http\Controllers\Ideas;

use App\Http\Controllers\Controller;
use App\Models\CollaborationRequest;
use App\Models\IdeaClassification;
use App\Models\User;
use App\Services\Ideas\Decisions\DecisionService;
use App\Services\Ideas\IdeaCategoryService;
use App\Services\Ideas\IdeaService;
use Illuminate\Http\Request;
use Inertia\Response;

class ReviewController extends Controller
{
    public function __construct(
        private IdeaService $ideaService,
        private IdeaCategoryService $ideaCategoryService,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $tab = $request->query('tab', 'assign-officer');

        $pendingAssignment = $user->can('idea.assign_officer')
            ? $this->ideaService->getPendingAssignment()
            : null;

        $myAssignments = $user->can('idea.classify')
            ? $this->ideaService->getMyAssignments($user)
            : null;

        $officers = $user->can('idea.assign_officer')
            ? User::orderBy('name')->get(['id', 'name', 'email'])
            : [];

        return inertia('ideas/review', [
            'currentTab' => $tab,
            'pendingAssignment' => $pendingAssignment,
            'myAssignments' => $myAssignments,
            'canAssign' => $user->can('idea.assign_officer'),
            'canClassify' => $user->can('idea.classify'),
            'officers' => $officers,
        ]);
    }

    public function show(Request $request, string $slug): Response
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            abort(404);
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

        $canProposeChanges = $idea->isOpen() && $idea->userCan($user, 'idea.propose_changes');
        $canApproveChanges = $idea->isOpen() && $idea->userCan($user, 'idea.approve_changes');

        $hasPendingCollaborationCount = CollaborationRequest::where('idea_id', $idea->id)
            ->where('status', 'pending')
            ->count();

        return inertia('ideas/review-show', [
            'idea' => $idea,
            'canAssign' => $canAssign,
            'canClassify' => $canClassify,
            'classifications' => $canClassify
                ? IdeaClassification::orderBy('name')->get()
                : [],
            'categories' => $notClassified
                ? $this->ideaCategoryService->getAll()
                : [],
            'officers' => $canAssign && ! $idea->assigned_officer_id
                ? User::select('id', 'name', 'email')->orderBy('name')->get()
                : [],
            'canRecordDecision' => $canRecordDecision,
            'validDecisions' => $validDecisions,
            'canProgress' => $canProgress,
            'canRequestRevision' => $canRequestRevision,
            'canProposeChanges' => $canProposeChanges,
            'canApproveChanges' => $canApproveChanges,
            'hasPendingCollaborationCount' => $hasPendingCollaborationCount,
        ]);
    }
}
