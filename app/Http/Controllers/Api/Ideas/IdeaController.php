<?php

namespace App\Http\Controllers\Api\Ideas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ideas\StoreIdeaRequest;
use App\Http\Requests\Ideas\UpdateIdeaRequest;
use App\Models\CollaborationRequest;
use App\Services\AuditService;
use App\Services\Ideas\IdeaService;
use Illuminate\Http\JsonResponse;

class IdeaController extends Controller
{
    public function __construct(
        private IdeaService $ideaService,
        private AuditService $auditService,
    ) {}

    public function index(): JsonResponse
    {
        $ideas = $this->ideaService->getAll();

        return response()->json($ideas);
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

        $user = request()->user();
        $hasPendingRequest = CollaborationRequest::where('idea_id', $idea->id)
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->exists();

        return response()->json(
            $idea->load(['author', 'category', 'invitations', 'documents', 'ipRight.documents', 'assignedOfficer'])
                ->toArray() + ['has_pending_collaboration_request' => $hasPendingRequest],
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
            $request->safe()->except(['proposal_file', 'support_documents', 'has_ip_protection', 'patent_number', 'consent_given', 'ip_documents']),
            $request->file('proposal_file'),
            $request->file('support_documents', []),
            $request->safe()->only(['has_ip_protection', 'patent_number', 'consent_given']),
            $request->file('ip_documents', []),
        );

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
