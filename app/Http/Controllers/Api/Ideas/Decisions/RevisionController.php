<?php

namespace App\Http\Controllers\Api\Ideas\Decisions;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ideas\Decisions\RequestRevisionRequest;
use App\Models\Idea;
use App\Services\Ideas\Decisions\DecisionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RevisionController extends Controller
{
    public function __construct(
        private DecisionService $decisionService,
    ) {}

    public function requestRevision(RequestRevisionRequest $request, Idea $idea): JsonResponse
    {
        if (! $idea->canBeRevised()) {
            return response()->json(['message' => 'This idea cannot be revised at this stage.'], 422);
        }

        $this->decisionService->requestRevision(
            $idea,
            $request->user(),
            $request->validated()['remarks'],
        );

        return response()->json(['message' => 'Revision requested.']);
    }

    public function resubmit(Request $request, Idea $idea): JsonResponse
    {
        $request->validate(['remarks' => 'nullable|string|max:5000']);

        $this->decisionService->resubmit(
            $idea,
            $request->user(),
            $request->validated()['remarks'] ?? null,
        );

        return response()->json(['message' => 'Idea resubmitted for review.']);
    }
}
