<?php

namespace App\Http\Controllers\Api\Ideas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ideas\StoreIdeaRequest;
use App\Http\Requests\Ideas\UpdateIdeaRequest;
use App\Models\CollaborationRequest;
use App\Models\IdeaClassification;
use App\Models\User;
use App\Services\AuditService;
use App\Services\Ideas\Decisions\DecisionService;
use App\Services\Ideas\IdeaCategoryService;
use App\Services\Ideas\IdeaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IdeaController extends Controller
{
    public function __construct(
        private IdeaService $ideaService,
        private IdeaCategoryService $ideaCategoryService,
        private AuditService $auditService,
        private DecisionService $decisionService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $tab = $request->query('tab', 'my-ideas');
        $search = $request->query('search');
        $filters = $request->only(['status', 'category_id', 'date_from', 'date_to']);
        $filters = array_filter($filters, fn ($v) => $v !== null && $v !== '');

        if (! empty($filters['status'])) {
            $filters['status'] = explode(',', $filters['status']);
        }

        $user = $request->user();

        $ideas = match ($tab) {
            'my-ideas' => $this->ideaService->getMyIdeas($user, $search, $filters),
            'open-for-collaboration' => $this->ideaService->getOpenForCollaboration($user, $search, $filters),
            'my-contributions' => $this->ideaService->getMyContributions($user, $search, $filters),
            default => $this->ideaService->getAll($search, $filters),
        };

        return response()->json([
            'ideas' => $ideas,
            'currentTab' => $tab,
            'categories' => $this->ideaCategoryService->getAll(),
            'filters' => $filters,
            'search' => $search,
        ]);
    }

    public function store(StoreIdeaRequest $request): JsonResponse
    {
        $idea = $this->ideaService->create(
            $request->user(),
            $request->safe()->except(['proposal_file', 'support_documents', 'has_ip_protection', 'patent_number', 'consent_given', 'ip_documents']),
            $request->file('proposal_file'),
            $request->file('support_documents', []),
            $request->safe()->only(['has_ip_protection', 'patent_number', 'consent_given']),
            $request->file('ip_documents', []),
        );

        return response()->json($idea->load(['author', 'category', 'ipRight.documents']), 201);
    }

    public function show(string $slug): JsonResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $idea->load(['author', 'category', 'invitations', 'documents', 'ipRight.documents', 'assignedOfficer']);

        $user = request()->user();
        $isAuthor = $idea->author_id === $user->id;
        $hasPendingRequest = CollaborationRequest::where('idea_id', $idea->id)
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->exists();
        $hasApprovedRequest = CollaborationRequest::where('idea_id', $idea->id)
            ->where('user_id', $user->id)
            ->where('status', 'approved')
            ->exists();
        $hasAcceptedInvitation = $idea->invitations->contains(
            fn ($i) => $i->email === $user->email && $i->status === 'accepted'
        );
        $alreadyInvolved = $hasApprovedRequest || $hasAcceptedInvitation;
        $canRequestCollaboration = $idea->isOpen() && $idea->collaboration_enabled && ! $isAuthor && ! $hasPendingRequest && ! $alreadyInvolved;
        $hasPendingCount = CollaborationRequest::where('idea_id', $idea->id)
            ->where('status', 'pending')
            ->count();
        $canProposeChanges = $idea->isOpen() && $idea->userCan($user, 'idea.propose_changes');
        $canApproveChanges = $idea->isOpen() && $idea->userCan($user, 'idea.approve_changes');
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
        $canResubmit = $idea->author_id === $user->id
            && $idea->status === 'revision_requested';
        $canEdit = $isAuthor
            && $idea->status === 'draft';

        return response()->json(
            $idea->toArray() + [
                'can_edit' => $canEdit,
                'has_pending_collaboration_request' => $hasPendingRequest,
                'can_request_collaboration' => $canRequestCollaboration,
                'has_pending_collaboration_count' => $hasPendingCount,
                'can_propose_changes' => $canProposeChanges,
                'can_approve_changes' => $canApproveChanges,
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
                'can_resubmit' => $canResubmit,
            ],
        );
    }

    public function update(UpdateIdeaRequest $request, string $slug): JsonResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $this->ideaService->update(
            $idea,
            $request->user(),
            $request->safe()->except(['proposal_file', 'support_documents', 'has_ip_protection', 'patent_number', 'consent_given', 'ip_documents', 'resubmit_notes']),
            $request->file('proposal_file'),
            $request->file('support_documents', []),
            $request->safe()->only(['has_ip_protection', 'patent_number', 'consent_given']),
            $request->file('ip_documents', []),
        );

        if ($request->filled('resubmit_notes') && $idea->status === 'revision_requested' && $idea->author_id === $request->user()->id) {
            $this->decisionService->resubmit($idea, $request->user(), $request->input('resubmit_notes'));
        }

        return response()->json($idea->fresh()->load(['author', 'category', 'ipRight.documents']));
    }

    public function destroy(string $slug): JsonResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        if (! $idea->userCan(request()->user(), 'idea.delete')) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $this->auditService->log(request()->user(), 'idea_deleted', "Deleted idea: {$idea->title}");

        $idea->delete();

        return response()->json(['message' => 'Deleted successfully.']);
    }
}
