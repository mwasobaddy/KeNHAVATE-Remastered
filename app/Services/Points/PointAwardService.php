<?php

namespace App\Services\Points;

use App\Models\Point;
use App\Models\PointTransaction;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class PointAwardService
{
    public function __construct(
        private AuditService $auditService,
    ) {}

    public function award(User $user, Point $point): PointTransaction
    {
        $transaction = PointTransaction::create([
            'user_id' => $user->id,
            'point_id' => $point->id,
            'points' => $point->points,
        ]);

        $user->increment('points_balance', $point->points);

        $this->auditService->log(
            $user,
            'point_awarded',
            "Awarded {$point->points} points for {$point->name}",
        );

        return $transaction;
    }

    public function getBalance(User $user): int
    {
        return $user->points_balance ?? 0;
    }

    public function getRecentTransactions(User $user, int $limit = 5): Collection
    {
        return $user->pointTransactions()
            ->with('point:id,name')
            ->latest('created_at')
            ->limit($limit)
            ->get();
    }

    public function getAllTransactions(int $perPage = 30): LengthAwarePaginator
    {
        return PointTransaction::with(['point:id,name', 'user:id,name'])
            ->latest('created_at')
            ->paginate($perPage);
    }

    public function hasBeenAwardedToday(User $user, Point $point): bool
    {
        return PointTransaction::where('user_id', $user->id)
            ->where('point_id', $point->id)
            ->whereDate('created_at', today())
            ->exists();
    }

    public function getLeaderboard(int $perPage = 20): LengthAwarePaginator
    {
        return User::where('points_balance', '>', 0)
            ->orderBy('points_balance', 'desc')
            ->paginate($perPage, ['id', 'name', 'points_balance']);
    }

    public function getSystemStats(): array
    {
        return [
            'total_points_awarded' => PointTransaction::sum('points'),
            'total_transactions' => PointTransaction::count(),
            'users_with_points' => User::where('points_balance', '>', 0)->count(),
            'active_actions' => Point::where('is_active', true)->count(),
        ];
    }
}
