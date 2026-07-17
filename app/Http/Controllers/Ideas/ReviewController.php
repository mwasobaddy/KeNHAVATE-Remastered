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
        $canAssign = $user->can('idea.assign_officer');
        $canClassify = $user->can('idea.classify');
        $canRecordDecision = $user->can('idea.record_decision');
        $hasQueueAccess = $canClassify || $canRecordDecision;
        $hasReviewAccess = $hasQueueAccess || $user->hasPermissionTo('idea.review');

        $defaultTab = match (true) {
            $canAssign => 'assign-officer',
            $hasQueueAccess => 'my-queue',
            $hasReviewAccess => 'reviewed',
            default => 'assign-officer',
        };
        $tab = $request->query('tab', $defaultTab);

        $pendingAssignment = $canAssign
            ? $this->ideaService->getPendingAssignment()
            : null;

        $myQueue = $hasQueueAccess
            ? $this->ideaService->getMyQueue($user)
            : null;

        $reviewed = $hasReviewAccess
            ? $this->ideaService->getReviewed($user)
            : null;

        $officers = $canAssign
            ? User::permission('idea.review')->orderBy('name')->get(['id', 'name', 'email'])
            : [];

        return inertia('ideas/review', [
            'currentTab' => $tab,
            'pendingAssignment' => $pendingAssignment,
            'myQueue' => $myQueue,
            'reviewed' => $reviewed,
            'canAssign' => $canAssign,
            'canClassify' => $canClassify,
            'canRecordDecision' => $canRecordDecision,
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
                ? User::permission('idea.review')->select('id', 'name', 'email')->orderBy('name')->get()
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
