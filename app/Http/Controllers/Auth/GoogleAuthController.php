<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
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
        $email = $googleUser->getEmail();

        $deletedUser = User::withTrashed()
            ->where(fn ($q) => $q->where('email', $email)->orWhere('work_email', $email))
            ->whereNotNull('deleted_at')
            ->first();

        if ($deletedUser) {
            session([
                'account_deleted_email' => $email,
                'account_deleted_flow' => 'google',
                'account_deleted_google_name' => $googleUser->getName(),
                'account_deleted_google_id' => $googleUser->getId(),
            ]);

            return redirect()->route('auth.account-deleted')
                ->with('error', 'This account was deleted. You can start fresh or contact support to restore it.');
        }

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
