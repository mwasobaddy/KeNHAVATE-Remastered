<?php

namespace App\Providers;

use App\Listeners\AwardDailyLoginPoints;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->shareAuthData();
        $this->registerEventListeners();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    protected function registerEventListeners(): void
    {
        Event::listen(Login::class, AwardDailyLoginPoints::class);
    }

    protected function shareAuthData(): void
    {
        Inertia::share('auth', function () {
            $user = auth()->user();

            if (! $user) {
                return null;
            }

            return [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'first_name' => $user->first_name,
                    'other_names' => $user->other_names,
                    'roles' => $user->getRoleNames()->toArray(),
                    'points_balance' => $user->points_balance,
                ],
                'roles' => $user->getRoleNames()->toArray(),
                'unread_notifications' => $user->unreadNotifications()->count(),
            ];
        });
    }
}
