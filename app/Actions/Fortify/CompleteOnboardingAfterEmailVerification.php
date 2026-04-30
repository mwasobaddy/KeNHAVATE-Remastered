<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Http\Request;

class CompleteOnboardingAfterEmailVerification
{
    /**
     * Complete onboarding for users who verified their personal email.
     */
    public function handle(Request $request): void
    {
        $user = $request->user();

        if (! $user) {
            return;
        }

        // Only complete onboarding if it's still pending
        if (! $user->onboarding_completed) {
            // Check if user is a Kenha email user (work email already verified via OTP)
            $isKenhaEmail = ! empty($user->work_email) && str_ends_with($user->work_email, '@kenha.co.ke');

            // If Kenha user, their personal email (email_verified_at) being verified
            // means they can proceed with onboarding completion
            if ($isKenhaEmail && $user->hasVerifiedEmail()) {
                $user->update(['onboarding_completed' => true]);
            }
        }
    }
}
