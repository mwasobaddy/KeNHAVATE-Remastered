<?php

namespace App\Http\Controllers\Ideas;

use App\Http\Controllers\Controller;
use App\Services\Ideas\IdeaService;
use Illuminate\Http\Request;
use Inertia\Response;

class ReviewController extends Controller
{
    public function __construct(
        private IdeaService $ideaService,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $tab = $request->query('tab', 'pending-assignment');

        $pendingAssignment = $user->can('idea.assign_officer')
            ? $this->ideaService->getPendingAssignment()
            : null;

        $myAssignments = $user->can('idea.classify')
            ? $this->ideaService->getMyAssignments($user)
            : null;

        return inertia('ideas/review', [
            'currentTab' => $tab,
            'pendingAssignment' => $pendingAssignment,
            'myAssignments' => $myAssignments,
            'canAssign' => $user->can('idea.assign_officer'),
            'canClassify' => $user->can('idea.classify'),
        ]);
    }
}
