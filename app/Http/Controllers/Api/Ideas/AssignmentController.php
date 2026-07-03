<?php

namespace App\Http\Controllers\Api\Ideas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ideas\AssignOfficerRequest;
use App\Models\User;
use App\Services\Ideas\AssignmentService;
use App\Services\Ideas\IdeaService;
use Illuminate\Http\JsonResponse;

class AssignmentController extends Controller
{
    public function __construct(
        private IdeaService $ideaService,
        private AssignmentService $assignmentService,
    ) {}

    public function store(AssignOfficerRequest $request, string $slug): JsonResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        if ($idea->assigned_officer_id !== null) {
            return response()->json(['message' => 'An officer has already been assigned to this idea.'], 409);
        }

        $officer = User::findOrFail($request->officer_id);

        $this->assignmentService->assign($idea, $officer, $request->user());

        return response()->json(
            $idea->fresh()->load(['author', 'category', 'assignedOfficer']),
        );
    }
}
