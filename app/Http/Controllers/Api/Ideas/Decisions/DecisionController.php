<?php

namespace App\Http\Controllers\Api\Ideas\Decisions;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ideas\Decisions\ProgressRequest;
use App\Http\Requests\Ideas\Decisions\StoreDecisionRequest;
use App\Models\Idea;
use App\Services\Ideas\Decisions\DecisionService;
use Illuminate\Http\JsonResponse;

class DecisionController extends Controller
{
    public function __construct(
        private DecisionService $decisionService,
    ) {}

    public function store(StoreDecisionRequest $request, Idea $idea): JsonResponse
    {
        $this->decisionService->decide(
            $idea,
            $request->user(),
            $request->validated()['decision'],
            $request->validated()['remarks'] ?? null,
        );

        return response()->json(['message' => 'Decision recorded successfully.']);
    }

    public function progress(ProgressRequest $request, Idea $idea): JsonResponse
    {
        $this->decisionService->progress(
            $idea,
            $request->user(),
            $request->validated()['remarks'] ?? null,
        );

        return response()->json(['message' => 'Progress updated successfully.']);
    }
}
