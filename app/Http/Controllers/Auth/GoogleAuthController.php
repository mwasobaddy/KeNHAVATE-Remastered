<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\GoogleAuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function __construct(
        private GoogleAuthService $googleAuthService,
    ) {}

    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback(): RedirectResponse
    {
        $googleUser = Socialite::driver('google')->user();

        $user = $this->googleAuthService->findOrCreateUser($googleUser);

        Auth::login($user);

        if ($user->onboarding_completed_at) {
            return redirect()->intended(route('dashboard'))
                ->with('success', 'Welcome back!');
        }

        return redirect()->route('onboarding')
            ->with('success', 'Welcome! Please complete your profile.');
    }
}
