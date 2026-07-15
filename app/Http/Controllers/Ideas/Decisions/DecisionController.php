<?php

namespace App\Http\Controllers\Ideas\Decisions;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ideas\Decisions\ProgressIdeaRequest;
use App\Http\Requests\Ideas\Decisions\RecordDecisionRequest;
use App\Services\Ideas\Decisions\DecisionService;
use App\Services\Ideas\IdeaService;
use Illuminate\Http\RedirectResponse;

class DecisionController extends Controller
{
    public function __construct(
        private DecisionService $decisionService,
        private IdeaService $ideaService,
    ) {}

    public function store(RecordDecisionRequest $request, string $slug): RedirectResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            abort(404);
        }

        if (! DecisionService::canDecide($idea)) {
            return back()
                ->with('error', 'This idea cannot accept a decision at this stage.');
        }

        $validDecisions = DecisionService::getValidDecisions($idea);

        if (! in_array($request->decision, $validDecisions, true)) {
            return back()
                ->with('error', 'Invalid decision for this classification type.');
        }

        $this->decisionService->decide(
            $idea,
            $request->user(),
            $request->decision,
            $request->notes,
            $request->decision === 'budget_logged',
        );

        $statusLabels = [
            'approved' => 'approved successfully',
            'deferred' => 'deferred',
            'declined' => 'declined',
            'budget_logged' => 'logged for budget consideration',
            'closed' => 'closed',
        ];

        $label = $statusLabels[$request->decision] ?? $request->decision;

        $message = "Idea {$label}.";

        return back()
            ->with('success', $message);
    }

    public function progress(ProgressIdeaRequest $request, string $slug): RedirectResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            abort(404);
        }

        if (! DecisionService::canProgress($idea)) {
            return back()
                ->with('error', 'This idea cannot be progressed from its current status.');
        }

        $nextStatus = DecisionService::getNextStatus($idea->status);

        if ($nextStatus === null) {
            return back()
                ->with('error', 'Unable to determine next status.');
        }

        $this->decisionService->progress($idea, $request->user(), $request->notes);

        $statusLabels = [
            'in_progress' => 'marked as in progress',
            'completed' => 'marked as completed',
            'implemented' => 'marked as implemented',
            'closed' => 'closed',
        ];

        $label = $statusLabels[$nextStatus] ?? $nextStatus;

        $message = "Idea {$label}.";

        return back()
            ->with('success', $message);
    }
}
