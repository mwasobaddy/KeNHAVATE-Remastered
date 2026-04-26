<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialiteController extends Controller
{
    /**
     * Redirect to Google OAuth.
     */
    public function redirectToGoogle(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle Google OAuth callback with JIT provisioning.
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Find existing user by Google provider ID or email
            $user = User::where('provider', 'google')
                ->where('provider_id', $googleUser->getId())
                ->first();

            if (! $user) {
                // Check if user exists by email
                $user = User::where('email', $googleUser->getEmail())->first();

                if ($user) {
                    // Link Google account to existing user
                    $user->update([
                        'provider' => 'google',
                        'provider_id' => $googleUser->getId(),
                        'avatar' => $googleUser->getAvatar(),
                    ]);
                } else {
                    // JIT Provisioning: Create new user from Google data
                    $user = User::create([
                        'first_name' => $googleUser->getName(),
                        'other_names' => null,
                        'mobile_number' => null,
                        'gender' => null,
                        'email' => $googleUser->getEmail(),
                        'work_email' => null,
                        'password' => Hash::make(Str::random(24)),
                        'google_id' => $googleUser->getId(),
                        'department_id' => null,
                        'employment_type' => null,
                        'provider' => 'google',
                        'provider_id' => $googleUser->getId(),
                        'avatar' => $googleUser->getAvatar(),
                        'email_verified_at' => now(), // Google verified the email
                        'onboarding_completed' => false, // Do not skip onboarding for Google users
                    ]);
                }
                // Assign 'user' role to all Google-authenticated users
                $user->assignRole('user');
            }

            Auth::login($user, true);

            return redirect()->intended('/dashboard');
        } catch (\Exception $e) {
            return redirect()->route('login')->withErrors([
                'email' => 'Google authentication failed: '.$e->getMessage(),
            ]);
        }
    }
}
