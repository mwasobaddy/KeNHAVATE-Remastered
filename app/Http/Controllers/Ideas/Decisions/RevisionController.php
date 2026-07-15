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

        if (! $request->user()->can('idea.record_decision')) {
            return back()
                ->with('error', 'You do not have permission to request a revision.');
        }

        if (! $idea->canBeRevised()) {
            return back()
                ->with('error', 'This idea cannot be sent for revision at this stage.');
        }

        $this->decisionService->requestRevision($idea, $request->user(), $request->notes);

        return back()
            ->with('success', 'Revision requested. The author has been notified.');
    }

    public function resubmit(ResubmitRequest $request, string $slug): RedirectResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            abort(404);
        }

        if ($idea->status !== 'revision_requested') {
            return back()
                ->with('error', 'This idea is not awaiting revision.');
        }

        $this->decisionService->resubmit($idea, $request->user(), $request->notes);

        return back()
            ->with('success', 'Idea resubmitted successfully.');
    }
}
