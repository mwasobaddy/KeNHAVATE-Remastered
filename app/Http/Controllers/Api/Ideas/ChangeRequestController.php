<?php

namespace App\Http\Controllers\Api\Ideas;

use App\Http\Controllers\Controller;
use App\Models\ChangeRequest;
use App\Services\Ideas\ChangeRequestService;
use App\Services\Ideas\IdeaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChangeRequestController extends Controller
{
    public function __construct(
        private IdeaService $ideaService,
        private ChangeRequestService $changeRequestService,
    ) {}

    public function index(string $slug): JsonResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        return response()->json(
            $this->changeRequestService->getForIdea($idea),
        );
    }

    public function store(Request $request, string $slug): JsonResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        if (! $idea->userCan($request->user(), 'idea.propose_changes')) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'changes' => ['required', 'array', 'min:1'],
            'changes.*.field' => ['required', 'string', 'in:title,description,problem_statement,proposed_solution,cost_benefit_analysis'],
            'changes.*.new_value' => ['required', 'string'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $changes = array_map(fn ($c) => [
            'field' => $c['field'],
            'old_value' => $idea->{$c['field']},
            'new_value' => $c['new_value'],
        ], $validated['changes']);

        $changeRequest = $this->changeRequestService->propose(
            $request->user(),
            $idea,
            $changes,
            $validated['notes'] ?? null,
        );

        return response()->json($changeRequest->load('proposer'), 201);
    }

    public function show(string $slug, ChangeRequest $changeRequest): JsonResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea || $changeRequest->idea_id !== $idea->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        return response()->json($changeRequest->load(['proposer', 'reviewer']));
    }

    public function approve(Request $request, string $slug, ChangeRequest $changeRequest): JsonResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea || $changeRequest->idea_id !== $idea->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        if (! $idea->userCan($request->user(), 'idea.approve_changes')) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'feedback' => ['nullable', 'string', 'max:1000'],
        ]);

        $this->changeRequestService->approve(
            $changeRequest,
            $request->user(),
            $validated['feedback'] ?? null,
        );

        return response()->json(['message' => 'Change request approved.']);
    }

    public function hide(Request $request, string $slug, ChangeRequest $changeRequest): JsonResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea || $changeRequest->idea_id !== $idea->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        if ($changeRequest->user_id !== $request->user()->id && ! $idea->userCan($request->user(), 'idea.approve_changes')) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $this->changeRequestService->hide($request->user(), $changeRequest);

        return response()->json(['message' => 'Change request hidden.']);
    }

    public function unhide(Request $request, string $slug, ChangeRequest $changeRequest): JsonResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea || $changeRequest->idea_id !== $idea->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        if ($changeRequest->user_id !== $request->user()->id && ! $idea->userCan($request->user(), 'idea.approve_changes')) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $this->changeRequestService->unhide($request->user(), $changeRequest);

        return response()->json(['message' => 'Change request unhidden.']);
    }

    public function destroy(Request $request, string $slug, ChangeRequest $changeRequest): JsonResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea || $changeRequest->idea_id !== $idea->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        if ($changeRequest->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($changeRequest->status !== 'pending') {
            return response()->json(['message' => 'Only pending change requests can be deleted.'], 422);
        }

        $validated = $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $this->changeRequestService->delete($request->user(), $changeRequest);

        return response()->json(['message' => 'Change request deleted.']);
    }

    public function reject(Request $request, string $slug, ChangeRequest $changeRequest): JsonResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea || $changeRequest->idea_id !== $idea->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        if (! $idea->userCan($request->user(), 'idea.approve_changes')) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'feedback' => ['required', 'string', 'max:1000'],
        ]);

        $this->changeRequestService->reject(
            $changeRequest,
            $request->user(),
            $validated['feedback'],
        );

        return response()->json(['message' => 'Change request rejected.']);
    }
}
