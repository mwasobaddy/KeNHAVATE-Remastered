<?php

namespace App\Http\Controllers\Points;

use App\Http\Controllers\Controller;
use App\Services\Points\PointAwardService;
use Inertia\Response;

class LeaderboardController extends Controller
{
    public function __construct(
        private PointAwardService $pointAwardService,
    ) {}

    public function index(): Response
    {
        $currentUser = auth()->user();

        $leaderboard = $this->pointAwardService->getLeaderboard();

        $currentUserRank = $leaderboard->search(function ($user) use ($currentUser) {
            return $user->id === $currentUser->id;
        });

        return inertia('leaderboard', [
            'users' => $leaderboard,
            'currentUserRank' => $currentUserRank !== false ? $currentUserRank + 1 : null,
            'currentUserPoints' => $currentUser->points_balance,
            'systemStats' => $this->pointAwardService->getSystemStats(),
        ]);
    }
}
