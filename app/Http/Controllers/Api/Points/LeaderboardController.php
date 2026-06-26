<?php

namespace App\Http\Controllers\Api\Points;

use App\Http\Controllers\Controller;
use App\Services\Points\PointAwardService;
use Illuminate\Http\JsonResponse;

class LeaderboardController extends Controller
{
    public function __construct(
        private PointAwardService $pointAwardService,
    ) {}

    public function index(): JsonResponse
    {
        $leaderboard = $this->pointAwardService->getLeaderboard();

        return response()->json($leaderboard);
    }
}
