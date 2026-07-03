<?php

namespace App\Http\Controllers\Ideas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ideas\AssignOfficerRequest;
use App\Models\User;
use App\Services\Ideas\AssignmentService;
use App\Services\Ideas\IdeaService;
use Illuminate\Http\RedirectResponse;

class AssignmentController extends Controller
{
    public function __construct(
        private IdeaService $ideaService,
        private AssignmentService $assignmentService,
    ) {}

    public function store(AssignOfficerRequest $request, string $slug): RedirectResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            abort(404);
        }

        if ($idea->assigned_officer_id !== null) {
            return redirect()->route('ideas.show', $idea->slug)
                ->with('error', 'An officer has already been assigned to this idea.');
        }

        $officer = User::findOrFail($request->officer_id);

        $this->assignmentService->assign($idea, $officer, $request->user());

        return redirect()->route('ideas.show', $idea->slug)
            ->with('success', "{$officer->name} has been assigned as the RI&KM Officer.");
    }
}
