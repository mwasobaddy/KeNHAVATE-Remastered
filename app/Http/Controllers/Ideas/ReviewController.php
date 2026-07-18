<?php

namespace App\Http\Controllers\Ideas;

use App\Http\Controllers\Controller;
use App\Models\Idea;
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

        $tab = $request->query('tab', match (true) {
            $canAssign => 'assign-officer',
            $hasQueueAccess => 'my-queue',
            $hasReviewAccess => 'reviewed',
            default => 'assign-officer',
        });

        $search = $request->query('search');
        $filters = $request->only(['status', 'category_id', 'date_from', 'date_to']);
        $filters = array_filter($filters, fn ($v) => $v !== null && $v !== '');

        if (! empty($filters['status'])) {
            $filters['status'] = explode(',', $filters['status']);
        }

        $pendingAssignment = $canAssign
            ? $this->ideaService->getPendingAssignment($search, $filters)
            : null;

        $myQueue = $hasQueueAccess
            ? $this->ideaService->getMyQueue($user, $search, $filters)
            : null;

        $reviewed = $hasReviewAccess
            ? $this->ideaService->getReviewed($user, $search, $filters)
            : null;

        $officers = $canAssign
            ? User::permission('idea.review')->orderBy('name')->get(['id', 'name', 'email'])
            : [];

        $categories = $this->ideaCategoryService->getAll();

        $reviewStats = [
            'in_pipeline' => Idea::whereIn('status', ['submitted', 'assigned', 'classified', 'resubmitted'])->count(),
            'pending_assignment' => Idea::where('status', 'submitted')->whereNull('assigned_officer_id')->count(),
            'in_queue' => $hasQueueAccess
                ? $this->ideaService->getMyQueue($user, null, [], 1)->total()
                : 0,
            'reviewed' => $hasReviewAccess
                ? $this->ideaService->getReviewed($user, null, [], 1)->total()
                : 0,
        ];

        return inertia('ideas/review', [
            'currentTab' => $tab,
            'pendingAssignment' => $pendingAssignment,
            'myQueue' => $myQueue,
            'reviewed' => $reviewed,
            'canAssign' => $canAssign,
            'canClassify' => $canClassify,
            'canRecordDecision' => $canRecordDecision,
            'officers' => $officers,
            'categories' => $categories,
            'filters' => $filters,
            'search' => $search,
            'reviewStats' => $reviewStats,
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
        $isAssignedOfficer = $idea->assigned_officer_id === $user->id;
        $canClassify = $user->can('idea.classify') && $isAssignedOfficer
            && $idea->classification_id === null
            && in_array($idea->status, ['assigned', 'resubmitted']);
        $notClassified = $idea->classification_id === null && in_array($idea->status, ['assigned', 'resubmitted']);
        $canRecordDecision = $user->can('idea.record_decision') && $isAssignedOfficer
            && DecisionService::canDecide($idea);
        $validDecisions = $user->can('idea.record_decision')
            ? DecisionService::getValidDecisions($idea)
            : [];
        $canProgress = $user->can('idea.record_decision') && $isAssignedOfficer
            && DecisionService::canProgress($idea);
        $canRequestRevision = $user->can('idea.record_decision') && $isAssignedOfficer
            && $idea->canBeRevised();

        $canProposeChanges = $idea->isOpen() && $idea->userCan($user, 'idea.propose_changes');
        $canApproveChanges = $idea->isOpen() && $idea->userCan($user, 'idea.approve_changes');

        $hasPendingCollaborationCount = $idea->collaborationRequests()
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
