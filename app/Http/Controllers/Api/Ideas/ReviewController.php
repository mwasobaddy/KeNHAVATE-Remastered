<?php

namespace App\Http\Controllers\Api\Ideas;

use App\Http\Controllers\Controller;
use App\Services\Ideas\IdeaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function __construct(
        private IdeaService $ideaService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = [];

        if ($user->can('idea.assign_officer')) {
            $data['pending_assignment'] = $this->ideaService->getPendingAssignment();
        }

        if ($user->can('idea.classify')) {
            $data['my_assignments'] = $this->ideaService->getMyAssignments($user);
        }

        if ($user->can('idea.record_decision')) {
            $data['pending_decisions'] = $this->ideaService->getPendingDecisions();
        }

        return response()->json($data);
    }
}
