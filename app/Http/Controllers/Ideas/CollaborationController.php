<?php

namespace App\Http\Controllers\Ideas;

use App\Http\Controllers\Controller;
use App\Models\CollaborationRequest;
use App\Services\Ideas\CollaborationRequestService;
use App\Services\Ideas\IdeaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class CollaborationController extends Controller
{
    public function __construct(
        private IdeaService $ideaService,
        private CollaborationRequestService $collaborationRequestService,
    ) {}

    public function index(string $slug): Response
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            abort(404);
        }

        if (! $idea->userCan(request()->user(), 'idea.manage_contributors')) {
            abort(403);
        }

        return inertia('ideas/collaborations/index', [
            'idea' => $idea->only('slug', 'title'),
            'collaborationRequests' => $this->collaborationRequestService->getForIdea($idea),
        ]);
    }

    public function store(Request $request, string $slug): RedirectResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            abort(404);
        }

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
        ]);

        $this->collaborationRequestService->request(
            $request->user(),
            $idea,
            $validated['message'],
        );

        return redirect()->back()
            ->with('success', 'Collaboration request sent to the idea author.');
    }

    public function approve(Request $request, string $slug, CollaborationRequest $collaboration): RedirectResponse
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

        return redirect()->back()
            ->with('success', 'Collaboration request approved. User can now access the idea.');
    }

    public function reject(Request $request, string $slug, CollaborationRequest $collaboration): RedirectResponse
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

        return redirect()->back()
            ->with('success', 'Collaboration request rejected.');
    }
}
