<?php

namespace App\Services\Auth;

use App\Mail\SendOtpMail;
use App\Models\Otp;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class OtpService
{
    /**
     * Find or create user by email and send OTP.
     */
    public function sendOtp(string $email): User
    {
        $isKenhaEmail = Str::endsWith($email, '@kenha.co.ke');

        $user = $this->findOrCreateUser($email, $isKenhaEmail);

        if ($user->wasRecentlyCreated) {
            $role = $isKenhaEmail ? 'staff' : 'user';
            $user->assignRole($role);
        }

        $this->invalidateExistingOtps($user);
        $otpCode = $this->generateOtp();
        $this->saveOtp($user, $otpCode);
        $this->sendOtpEmail($email, $otpCode);

        return $user;
    }

    /**
     * Verify OTP and mark email as verified.
     */
    public function verifyOtp(string $email, string $otpCode): ?User
    {
        $user = $this->findUserByEmail($email);

        if (! $user) {
            return null;
        }

        $otp = $this->findValidOtp($user, $otpCode);

        if (! $otp) {
            return null;
        }

        $otp->markAsUsed();
        $this->markEmailAsVerified($user, $email);

        return $user;
    }

    /**
     * Resend OTP if needed.
     */
    public function resendOtp(string $email): void
    {
        $user = $this->findUserByEmail($email);

        if (! $user) {
            return;
        }

        $existingOtp = $this->findExistingValidOtp($user);

        if ($existingOtp) {
            $this->sendOtpEmail($email, $existingOtp->otp);

            return;
        }

        $otpCode = $this->generateOtp();
        $this->saveOtp($user, $otpCode);
        $this->sendOtpEmail($email, $otpCode);
    }

    /**
     * Find user by email (checks both email and work_email).
     */
    public function findUserByEmail(string $email): ?User
    {
        return User::where(function ($query) use ($email) {
            $query->where('email', $email)
                ->orWhere('work_email', $email);
        })->first();
    }

    /**
     * Generate a 6-digit OTP.
     */
    private function generateOtp(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Find or create user based on email type.
     */
    private function findOrCreateUser(string $email, bool $isKenhaEmail): User
    {
        if ($isKenhaEmail) {
            return User::firstOrCreate(
                ['work_email' => $email],
                [
                    'first_name' => explode('@', $email)[0],
                    'email' => $email,
                    'work_email' => $email,
                    'password' => null,
                    'email_verified_at' => null,
                    'work_email_verified_at' => now(),
                    'onboarding_completed' => false,
                ]
            );
        }

        return User::firstOrCreate(
            ['email' => $email],
            [
                'first_name' => explode('@', $email)[0],
                'email' => $email,
                'password' => null,
                'email_verified_at' => now(),
                'onboarding_completed' => false,
            ]
        );
    }

    /**
     * Invalidate existing unused OTPs for user.
     */
    private function invalidateExistingOtps(User $user): void
    {
        Otp::where('user_id', $user->id)
            ->where('type', 'login')
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->update(['used_at' => now()]);
    }

    /**
     * Save new OTP to database.
     */
    private function saveOtp(User $user, string $otpCode): Otp
    {
        return Otp::create([
            'user_id' => $user->id,
            'otp' => $otpCode,
            'type' => 'login',
            'expires_at' => now()->addMinutes(30),
        ]);
    }

    /**
     * Send OTP via email.
     */
    private function sendOtpEmail(string $email, string $otpCode): void
    {
        Mail::to($email)->send(new SendOtpMail($otpCode, 'login'));
    }

    /**
     * Find valid, unused OTP for user.
     */
    private function findValidOtp(User $user, string $otpCode): ?Otp
    {
        return Otp::where('user_id', $user->id)
            ->where('otp', $otpCode)
            ->where('type', 'login')
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->latest()
            ->first();
    }

    /**
     * Find existing valid OTP for user.
     */
    private function findExistingValidOtp(User $user): ?Otp
    {
        return Otp::where('user_id', $user->id)
            ->where('type', 'login')
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->latest()
            ->first();
    }

    /**
     * Mark appropriate email field as verified.
     */
    private function markEmailAsVerified(User $user, string $email): void
    {
        $isKenhaEmail = Str::endsWith($email, '@kenha.co.ke');

        if ($isKenhaEmail) {
            if (! $user->hasVerifiedWorkEmail()) {
                $user->markWorkEmailAsVerified();
            }
        } else {
            if (! $user->hasVerifiedEmail()) {
                $user->markEmailAsVerified();
            }
        }
    }
}
