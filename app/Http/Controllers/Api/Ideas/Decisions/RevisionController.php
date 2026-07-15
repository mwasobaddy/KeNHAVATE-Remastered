<?php

namespace App\Http\Controllers\Api\Ideas\Decisions;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ideas\Decisions\RequestRevisionRequest;
use App\Http\Requests\Ideas\Decisions\ResubmitRequest;
use App\Services\Ideas\Decisions\DecisionService;
use App\Services\Ideas\IdeaService;
use Illuminate\Http\JsonResponse;

class RevisionController extends Controller
{
    public function __construct(
        private DecisionService $decisionService,
        private IdeaService $ideaService,
    ) {}

    public function requestRevision(RequestRevisionRequest $request, string $slug): JsonResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        if (! $idea->canBeRevised()) {
            return response()->json(['message' => 'This idea cannot be revised at this stage.'], 422);
        }

        $this->decisionService->requestRevision(
            $idea,
            $request->user(),
            $request->validated()['notes'],
        );

        return response()->json(['message' => 'Revision requested.']);
    }

    public function resubmit(ResubmitRequest $request, string $slug): JsonResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        if ($idea->status !== 'revision_requested') {
            return response()->json(['message' => 'This idea is not awaiting revision.'], 422);
        }

        $this->decisionService->resubmit(
            $idea,
            $request->user(),
            $request->validated()['notes'],
        );

        return response()->json(['message' => 'Idea resubmitted for review.']);
    }
}
