<?php

namespace App\Listeners;

use App\Models\Point;
use App\Services\Points\PointAwardService;
use Illuminate\Auth\Events\Login;

class AwardDailyLoginPoints
{
    public function __construct(
        private PointAwardService $pointAwardService,
    ) {}

    public function handle(Login $event): void
    {
        $dailyLogin = Point::where('name', 'Daily Login')
            ->where('is_active', true)
            ->first();

        if (! $dailyLogin) {
            return;
        }

        if ($this->pointAwardService->hasBeenAwardedToday($event->user, $dailyLogin)) {
            return;
        }

        $this->pointAwardService->award($event->user, $dailyLogin);
    }
}
