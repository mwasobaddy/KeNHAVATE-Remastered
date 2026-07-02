<?php

namespace App\Http\Controllers\Api\Ideas;

use App\Http\Controllers\Controller;
use App\Models\CollaborationRequest;
use App\Services\Ideas\CollaborationRequestService;
use App\Services\Ideas\IdeaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CollaborationController extends Controller
{
    public function __construct(
        private IdeaService $ideaService,
        private CollaborationRequestService $collaborationRequestService,
    ) {}

    public function index(string $slug): JsonResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            abort(404);
        }

        if (! $idea->userCan(request()->user(), 'idea.manage_contributors')) {
            abort(403);
        }

        return response()->json(
            $this->collaborationRequestService->getForIdea($idea),
        );
    }

    public function store(Request $request, string $slug): JsonResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            abort(404);
        }

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
        ]);

        $collaborationRequest = $this->collaborationRequestService->request(
            $request->user(),
            $idea,
            $validated['message'],
        );

        return response()->json($collaborationRequest, 201);
    }

    public function approve(Request $request, string $slug, CollaborationRequest $collaboration): JsonResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea || $collaboration->idea_id !== $idea->id) {
            abort(404);
        }

        if (! $idea->userCan($request->user(), 'idea.manage_contributors')) {
            abort(403);
        }

        $validated = $request->validate([
            'feedback' => ['nullable', 'string', 'max:1000'],
        ]);

        $this->collaborationRequestService->approve(
            $collaboration,
            $request->user(),
            $validated['feedback'] ?? null,
        );

        return response()->json(['message' => 'Collaboration request approved.']);
    }

    public function reject(Request $request, string $slug, CollaborationRequest $collaboration): JsonResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea || $collaboration->idea_id !== $idea->id) {
            abort(404);
        }

        if (! $idea->userCan($request->user(), 'idea.manage_contributors')) {
            abort(403);
        }

        $validated = $request->validate([
            'feedback' => ['required', 'string', 'max:1000'],
        ]);

        $this->collaborationRequestService->reject(
            $collaboration,
            $request->user(),
            $validated['feedback'],
        );

        return response()->json(['message' => 'Collaboration request rejected.']);
    }
}
