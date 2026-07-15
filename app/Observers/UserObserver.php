<?php

namespace App\Observers;

use App\Models\Point;
use App\Models\PointTransaction;
use App\Models\User;

class UserObserver
{
    public function created(User $user): void
    {
        if ($user->pointTransactions()->whereHas('point', fn ($q) => $q->where('name', 'New Account'))->exists()) {
            return;
        }

        $newAccountPoint = Point::where('name', 'New Account')->where('is_active', true)->first();

        if (! $newAccountPoint) {
            return;
        }

        PointTransaction::create([
            'user_id' => $user->id,
            'point_id' => $newAccountPoint->id,
            'points' => $newAccountPoint->points,
        ]);

        $user->increment('points_balance', $newAccountPoint->points);
    }
}
