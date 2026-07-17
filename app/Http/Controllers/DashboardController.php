<?php

namespace App\Http\Controllers;

use App\Services\Points\PointAwardService;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private PointAwardService $pointAwardService,
    ) {}

    public function index(): Response
    {
        $user = auth()->user();

        $ideas = $user->authoredIdeas()->select('status')->get();

        $data = [
            'pointsBalance' => $this->pointAwardService->getBalance($user),
            'recentTransactions' => $this->pointAwardService->getRecentTransactions($user),
            'userIdeaStats' => [
                'total' => $ideas->count(),
                'drafts' => $ideas->where('status', 'draft')->count(),
                'under_review' => $ideas->whereIn('status', ['submitted', 'under_review'])->count(),
                'approved' => $ideas->where('status', 'approved')->count(),
            ],
            'pendingInvitations' => $user->pendingInvitations()
                ->with(['idea:id,title,slug', 'invitedBy:id,name'])
                ->latest()
                ->take(5)
                ->get(),
        ];

        if ($user->can('points.view')) {
            $data['systemStats'] = $this->pointAwardService->getSystemStats();
        }

        if ($user->can('points.create') || $user->can('points.edit') || $user->can('points.delete')) {
            $data['canManage'] = true;
        }

        return inertia('dashboard', $data);
    }
}
