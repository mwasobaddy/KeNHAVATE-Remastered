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

        $data = [
            'pointsBalance' => $this->pointAwardService->getBalance($user),
            'recentTransactions' => $this->pointAwardService->getRecentTransactions($user),
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
