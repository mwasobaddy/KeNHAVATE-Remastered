<?php

namespace App\Http\Controllers\Points;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Points\PointAwardService;
use Illuminate\Http\Request;
use Inertia\Response;

class LeaderboardController extends Controller
{
    public function __construct(
        private PointAwardService $pointAwardService,
    ) {}

    public function index(Request $request): Response
    {
        $currentUser = auth()->user();

        $leaderboard = $this->pointAwardService->getLeaderboard();

        $currentUserRank = User::where('points_balance', '>', 0)
            ->where('points_balance', '>', $currentUser->points_balance)
            ->count() + 1;

        return inertia('leaderboard', [
            'users' => $leaderboard,
            'currentUserRank' => $currentUser->points_balance > 0 ? $currentUserRank : null,
            'currentUserPoints' => $currentUser->points_balance,
            'systemStats' => $this->pointAwardService->getSystemStats(),
        ]);
    }
}
