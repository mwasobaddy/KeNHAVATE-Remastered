<?php

namespace App\Http\Controllers\Ideas\Decisions;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ideas\Decisions\RequestRevisionRequest;
use App\Http\Requests\Ideas\Decisions\ResubmitRequest;
use App\Services\Ideas\Decisions\DecisionService;
use App\Services\Ideas\IdeaService;
use Illuminate\Http\RedirectResponse;

class RevisionController extends Controller
{
    public function __construct(
        private DecisionService $decisionService,
        private IdeaService $ideaService,
    ) {}

    public function requestRevision(RequestRevisionRequest $request, string $slug): RedirectResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            abort(404);
        }

        if ($idea->assigned_officer_id !== $request->user()->id) {
            return redirect()->route('ideas.show', $idea->slug)
                ->with('error', 'Only the assigned officer can request a revision.');
        }

        if (! in_array($idea->status, ['assigned', 'resubmitted'], true)) {
            return redirect()->route('ideas.show', $idea->slug)
                ->with('error', 'This idea cannot be sent for revision at this stage.');
        }

        $this->decisionService->requestRevision($idea, $request->user(), $request->notes);

        return redirect()->route('ideas.show', $idea->slug)
            ->with('success', 'Revision requested. The author has been notified.');
    }

    public function resubmit(ResubmitRequest $request, string $slug): RedirectResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            abort(404);
        }

        if ($idea->status !== 'revision_requested') {
            return redirect()->route('ideas.show', $idea->slug)
                ->with('error', 'This idea is not awaiting revision.');
        }

        $this->decisionService->resubmit($idea, $request->user(), $request->notes);

        return redirect()->route('ideas.show', $idea->slug)
            ->with('success', 'Idea resubmitted successfully.');
    }
}
