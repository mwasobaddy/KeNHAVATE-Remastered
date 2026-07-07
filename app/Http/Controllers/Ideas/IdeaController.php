<?php

namespace App\Http\Controllers\Ideas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ideas\StoreIdeaRequest;
use App\Http\Requests\Ideas\UpdateIdeaRequest;
use App\Models\CollaborationRequest;
use App\Models\IdeaClassification;
use App\Models\IdeaDocument;
use App\Models\IdeaIpDocument;
use App\Models\User;
use App\Services\AuditService;
use App\Services\Ideas\Decisions\DecisionService;
use App\Services\Ideas\IdeaCategoryService;
use App\Services\Ideas\IdeaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class IdeaController extends Controller
{
    public function __construct(
        private IdeaService $ideaService,
        private IdeaCategoryService $ideaCategoryService,
        private AuditService $auditService,
    ) {}

    public function index(Request $request): Response
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

        return inertia('ideas/index', [
            'ideas' => $ideas,
            'currentTab' => $tab,
            'categories' => $this->ideaCategoryService->getAll(),
            'filters' => $filters,
            'search' => $search,
        ]);
    }

    public function create(): Response
    {
        return inertia('ideas/create', [
            'categories' => $this->ideaCategoryService->getAll(),
        ]);
    }

    public function store(StoreIdeaRequest $request): RedirectResponse
    {
        $idea = $this->ideaService->create(
            $request->user(),
            $request->safe()->except(['proposal_file', 'support_documents', 'has_ip_protection', 'patent_number', 'consent_given', 'ip_documents']),
            $request->file('proposal_file'),
            $request->file('support_documents', []),
            $request->safe()->only(['has_ip_protection', 'patent_number', 'consent_given']),
            $request->file('ip_documents', []),
        );

        return redirect()->route('ideas.show', $idea->slug)
            ->with('success', 'Idea created successfully!');
    }

    public function show(string $slug): Response
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            abort(404);
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
        $canRequestCollaboration = $idea->collaboration_enabled && ! $isAuthor && ! $hasPendingRequest && ! $alreadyInvolved;
        $hasPendingCount = CollaborationRequest::where('idea_id', $idea->id)
            ->where('status', 'pending')
            ->count();
        $canProposeChanges = $idea->userCan($user, 'idea.propose_changes');
        $canApproveChanges = $idea->userCan($user, 'idea.approve_changes');
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
        $canRequestRevision = $idea->assigned_officer_id === $user->id
            && in_array($idea->status, ['assigned', 'resubmitted'], true);
        $canResubmit = $idea->author_id === $user->id
            && $idea->status === 'revision_requested';

        return inertia('ideas/show', [
            'idea' => $idea,
            'canRequestCollaboration' => $canRequestCollaboration,
            'hasPendingCollaborationCount' => $hasPendingCount,
            'canProposeChanges' => $canProposeChanges,
            'canApproveChanges' => $canApproveChanges,
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
            'canResubmit' => $canResubmit,
        ]);
    }

    public function edit(string $slug): Response
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            abort(404);
        }

        if (! $idea->userCan(request()->user(), 'idea.edit')) {
            abort(403);
        }

        return inertia('ideas/edit', [
            'idea' => $idea->load(['documents', 'ipRight.documents']),
            'categories' => $this->ideaCategoryService->getAll(),
        ]);
    }

    public function update(UpdateIdeaRequest $request, string $slug): RedirectResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            abort(404);
        }

        $this->ideaService->update(
            $idea,
            $request->user(),
            $request->safe()->except(['proposal_file', 'support_documents', 'has_ip_protection', 'patent_number', 'consent_given', 'ip_documents']),
            $request->file('proposal_file'),
            $request->file('support_documents', []),
            $request->safe()->only(['has_ip_protection', 'patent_number', 'consent_given']),
            $request->file('ip_documents', []),
        );

        return redirect()->route('ideas.show', $idea->slug)
            ->with('success', 'Idea updated successfully!');
    }

    public function downloadDocument(string $slug, IdeaDocument $document): StreamedResponse|RedirectResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea || $document->idea_id !== $idea->id) {
            abort(404);
        }

        if (! Storage::disk('local')->exists($document->file_path)) {
            abort(404);
        }

        return Storage::disk('local')->download($document->file_path, $document->original_name);
    }

    public function downloadIpDocument(string $slug, IdeaIpDocument $ipDocument): StreamedResponse|RedirectResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea || ! $idea->ipRight || $ipDocument->idea_ip_right_id !== $idea->ipRight->id) {
            abort(404);
        }

        if (! Storage::disk('local')->exists($ipDocument->file_path)) {
            abort(404);
        }

        return Storage::disk('local')->download($ipDocument->file_path, $ipDocument->original_name);
    }

    public function destroy(string $slug): RedirectResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            abort(404);
        }

        if (! $idea->userCan(request()->user(), 'idea.delete')) {
            abort(403);
        }

        $this->auditService->log(request()->user(), 'idea_deleted', "Deleted idea: {$idea->title}");

        $idea->delete();

        return redirect()->route('ideas.index')
            ->with('success', 'Idea deleted successfully.');
    }
}
