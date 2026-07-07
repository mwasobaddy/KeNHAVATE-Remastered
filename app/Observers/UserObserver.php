<?php

namespace App\Observers;

use App\Models\Point;
use App\Models\PointTransaction;
use App\Models\User;

class UserObserver
{
    public function created(User $user): void
    {
        $newAccountPoint = Point::where('name', 'New Account')->first();

        if (! $newAccountPoint?->is_active) {
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
