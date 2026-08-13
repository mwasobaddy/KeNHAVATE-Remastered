<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\SendOtp;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(
        private OtpService $otpService,
        private AuditService $auditService,
    ) {}

    public function initiateOtpLogin(string $email): User
    {
        $isKenha = str_ends_with($email, '@kenha.co.ke');

        $user = User::where('email', $email)->orWhere('work_email', $email)->first();

        // nullify the terms_accepted column
        if ($user) {
            $user->forceFill(['terms_accepted' => false])->save();
        }

        if (! $user) {
            $user = User::create([
                'name' => Str::before($email, '@'),
                'email' => $isKenha ? null : $email,
                'work_email' => $isKenha ? $email : null,
                'password' => Hash::make(Str::random(32)),
            ]);

            $this->auditService->log($user, 'account_created', "Account created via OTP for {$email}");
        }

        if ($isKenha) {
            $user->forceFill(['work_email' => $email])->save();
        }

        $otp = $this->otpService->generate($email, $user);
        $this->sendOtp($user, $email, $otp);

        $this->auditService->log($user, 'otp_requested', "OTP sent to {$email}");

        return $user;
    }

    public function verifyOtpLogin(string $email, string $otp): User
    {
        if (! $this->otpService->verify($email, $otp)) {
            throw new \RuntimeException('Invalid or expired OTP.');
        }

        $user = User::where('email', $email)->orWhere('work_email', $email)->firstOrFail();

        if (is_null($user->email_verified_at)) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        if ($user->work_email && is_null($user->work_email_verified_at)) {
            $user->forceFill(['work_email_verified_at' => now()])->save();
        }

        $this->auditService->log($user, 'login', "Logged in via OTP ({$email})");

        return $user;
    }

    public function resendOtp(string $email): User
    {
        $user = User::where('email', $email)->orWhere('work_email', $email)->firstOrFail();

        $otp = $this->otpService->getCurrentOtp($email) ?? $this->otpService->generate($email, $user);
        $this->sendOtp($user, $email, $otp);

        $this->auditService->log($user, 'otp_requested', "OTP resent to {$email}");

        return $user;
    }

    protected function sendOtp(User $user, string $email, string $otp): void
    {
        try {
            $user->notify(new SendOtp($otp));
        } catch (\Throwable $e) {
            Log::error('OTP email failed to send', [
                'email' => $email,
                'error' => $e->getMessage(),
            ]);

            throw ValidationException::withMessages([
                'email' => 'We could not email your one-time password. Please try again or sign in with Google.',
            ]);
        }
    }
}
