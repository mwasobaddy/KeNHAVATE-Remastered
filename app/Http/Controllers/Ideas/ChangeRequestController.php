<?php

namespace App\Http\Controllers\Ideas;

use App\Http\Controllers\Controller;
use App\Models\ChangeRequest;
use App\Services\Ideas\ChangeRequestService;
use App\Services\Ideas\IdeaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class ChangeRequestController extends Controller
{
    public function __construct(
        private IdeaService $ideaService,
        private ChangeRequestService $changeRequestService,
    ) {}

    public function index(Request $request, string $slug): Response
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            abort(404);
        }

        return inertia('ideas/changes/index', [
            'idea' => $idea->load('author'),
            'changeRequests' => $this->changeRequestService->getForIdea($idea, $request->user()),
        ]);
    }

    public function mine(Request $request): Response
    {
        return inertia('ideas/changes/mine', [
            'changeRequests' => $this->changeRequestService->getForUser($request->user())['proposed'],
        ]);
    }

    public function pending(Request $request): Response
    {
        return inertia('ideas/changes/pending',
            $this->changeRequestService->getForReviewAll($request->user()),
        );
    }

    public function create(string $slug): Response
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            abort(404);
        }

        if (! $idea->userCan(request()->user(), 'idea.propose_changes')) {
            abort(403);
        }

        return inertia('ideas/changes/create', [
            'idea' => $idea->only([
                'slug', 'title', 'description', 'problem_statement',
                'proposed_solution', 'cost_benefit_analysis',
            ]),
        ]);
    }

    public function store(Request $request, string $slug): RedirectResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            abort(404);
        }

        if (! $idea->userCan($request->user(), 'idea.propose_changes')) {
            abort(403);
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

        $this->changeRequestService->propose(
            $request->user(),
            $idea,
            $changes,
            $validated['notes'] ?? null,
        );

        return redirect()->route('ideas.changes.index', $idea->slug)
            ->with('success', 'Change request submitted for review.');
    }

    public function show(string $slug, ChangeRequest $changeRequest): Response
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea || $changeRequest->idea_id !== $idea->id) {
            abort(404);
        }

        $authorized = $idea->userCan(request()->user(), 'idea.view_changes')
            || $changeRequest->user_id === request()->user()->id;

        if (! $authorized) {
            abort(403);
        }

        return inertia('ideas/changes/show', [
            'idea' => $idea->only('slug', 'title'),
            'changeRequest' => $changeRequest->load(['proposer', 'reviewer']),
            'canReview' => $idea->userCan(request()->user(), 'idea.approve_changes'),
        ]);
    }

    public function approve(Request $request, string $slug, ChangeRequest $changeRequest): RedirectResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea || $changeRequest->idea_id !== $idea->id) {
            abort(404);
        }

        if (! $idea->userCan($request->user(), 'idea.approve_changes')) {
            abort(403);
        }

        $validated = $request->validate([
            'feedback' => ['nullable', 'string', 'max:1000'],
        ]);

        $this->changeRequestService->approve(
            $changeRequest,
            $request->user(),
            $validated['feedback'] ?? null,
        );

        return redirect()->route('ideas.changes.index', $idea->slug)
            ->with('success', 'Change request approved and applied.');
    }

    public function hide(Request $request, string $slug, ChangeRequest $changeRequest): RedirectResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea || $changeRequest->idea_id !== $idea->id) {
            abort(404);
        }

        if ($changeRequest->user_id !== $request->user()->id && ! $idea->userCan($request->user(), 'idea.approve_changes')) {
            abort(403);
        }

        $this->changeRequestService->hide($request->user(), $changeRequest);

        return back()->with('success', 'Change request hidden.');
    }

    public function unhide(Request $request, string $slug, ChangeRequest $changeRequest): RedirectResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea || $changeRequest->idea_id !== $idea->id) {
            abort(404);
        }

        if ($changeRequest->user_id !== $request->user()->id && ! $idea->userCan($request->user(), 'idea.approve_changes')) {
            abort(403);
        }

        $this->changeRequestService->unhide($request->user(), $changeRequest);

        return back()->with('success', 'Change request unhidden.');
    }

    public function destroy(Request $request, string $slug, ChangeRequest $changeRequest): RedirectResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea || $changeRequest->idea_id !== $idea->id) {
            abort(404);
        }

        if ($changeRequest->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($changeRequest->status !== 'pending') {
            return back()->withErrors(['error' => 'Only pending change requests can be deleted.']);
        }

        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $this->changeRequestService->delete($request->user(), $changeRequest);

        return redirect()->route('ideas.changes.index', $slug)
            ->with('success', 'Change request deleted.');
    }

    public function reject(Request $request, string $slug, ChangeRequest $changeRequest): RedirectResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea || $changeRequest->idea_id !== $idea->id) {
            abort(404);
        }

        if (! $idea->userCan($request->user(), 'idea.approve_changes')) {
            abort(403);
        }

        $validated = $request->validate([
            'feedback' => ['required', 'string', 'max:1000'],
        ]);

        $this->changeRequestService->reject(
            $changeRequest,
            $request->user(),
            $validated['feedback'],
        );

        return redirect()->route('ideas.changes.index', $idea->slug)
            ->with('success', 'Change request rejected.');
    }
}
