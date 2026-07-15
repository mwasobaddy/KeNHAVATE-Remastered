<?php

namespace App\Http\Controllers\Api\Ideas\Decisions;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ideas\Decisions\ProgressRequest;
use App\Http\Requests\Ideas\Decisions\StoreDecisionRequest;
use App\Services\Ideas\Decisions\DecisionService;
use App\Services\Ideas\IdeaService;
use Illuminate\Http\JsonResponse;

class DecisionController extends Controller
{
    public function __construct(
        private DecisionService $decisionService,
        private IdeaService $ideaService,
    ) {}

    public function store(StoreDecisionRequest $request, string $slug): JsonResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        if (! DecisionService::canDecide($idea)) {
            return response()->json(['message' => 'This idea cannot accept a decision at this stage.'], 422);
        }

        $validDecisions = DecisionService::getValidDecisions($idea);

        if (! in_array($request->decision, $validDecisions, true)) {
            return response()->json(['message' => 'Invalid decision for this classification type.'], 422);
        }

        $this->decisionService->decide(
            $idea,
            $request->user(),
            $request->validated()['decision'],
            $request->validated()['notes'] ?? null,
        );

        return response()->json(['message' => 'Decision recorded successfully.']);
    }

    public function progress(ProgressRequest $request, string $slug): JsonResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        if (! DecisionService::canProgress($idea)) {
            return response()->json(['message' => 'This idea cannot be progressed from its current status.'], 422);
        }

        $nextStatus = DecisionService::getNextStatus($idea->status);

        if ($nextStatus === null) {
            return response()->json(['message' => 'Unable to determine next status.'], 422);
        }

        $this->decisionService->progress(
            $idea,
            $request->user(),
            $request->validated()['notes'] ?? null,
        );

        return response()->json(['message' => 'Progress updated successfully.']);
    }
}
