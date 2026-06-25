<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\SendOtp;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthService
{
    public function __construct(
        private OtpService $otpService,
    ) {}

    public function initiateOtpLogin(string $email): User
    {
        $isKenha = str_ends_with($email, '@kenha.co.ke');

        $user = User::where('email', $email)->orWhere('work_email', $email)->first();

        if (! $user) {
            $user = User::create([
                'name' => Str::before($email, '@'),
                'email' => $isKenha ? null : $email,
                'work_email' => $isKenha ? $email : null,
                'password' => Hash::make(Str::random(32)),
            ]);
        }

        if ($isKenha) {
            $user->forceFill(['work_email' => $email])->save();
        }

        $otp = $this->otpService->generate($email, $user);
        $user->notify(new SendOtp($otp));

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

        return $user;
    }

    public function resendOtp(string $email): User
    {
        $user = User::where('email', $email)->orWhere('work_email', $email)->firstOrFail();

        $otp = $this->otpService->getCurrentOtp($email) ?? $this->otpService->generate($email, $user);
        $user->notify(new SendOtp($otp));

        return $user;
    }
}
