<?php

namespace App\Services;

use App\Models\OtpCode;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

class OtpService
{
    private const OTP_PREFIX = 'otp_';

    private const COOLDOWN_PREFIX = 'otp_send:';

    private const TTL = 600;

    private const COOLDOWN_TTL = 60;

    public function generate(string $email, ?User $user = null): string
    {
        $otp = (string) random_int(100000, 999999);

        Cache::put(self::OTP_PREFIX.$email, [
            'otp' => $otp,
            'attempts' => 0,
        ], now()->addSeconds(self::TTL));

        OtpCode::create([
            'user_id' => $user?->id,
            'email' => $email,
            'otp' => $otp,
            'type' => 'login',
            'attempts' => 0,
            'expires_at' => now()->addSeconds(self::TTL),
        ]);

        return $otp;
    }

    public function verify(string $email, string $otp): bool
    {
        $cached = Cache::get(self::OTP_PREFIX.$email);

        if ($cached === null) {
            return false;
        }

        if ($cached['attempts'] >= 5) {
            Cache::forget(self::OTP_PREFIX.$email);

            return false;
        }

        Cache::put(self::OTP_PREFIX.$email, [
            'otp' => $cached['otp'],
            'attempts' => $cached['attempts'] + 1,
        ], now()->addSeconds(self::TTL));

        OtpCode::forEmail($email)
            ->type('login')
            ->unused()
            ->latest()
            ->first()
            ?->increment('attempts');

        if ($cached['otp'] !== $otp) {
            return false;
        }

        Cache::forget(self::OTP_PREFIX.$email);

        OtpCode::forEmail($email)
            ->type('login')
            ->unused()
            ->latest()
            ->first()
            ?->update(['used_at' => now()]);

        return true;
    }

    public function hasRecentOtp(string $email): bool
    {
        return Cache::has(self::OTP_PREFIX.$email);
    }

    public function getCurrentOtp(string $email): ?string
    {
        $cached = Cache::get(self::OTP_PREFIX.$email);

        return $cached['otp'] ?? null;
    }

    public function clear(string $email): void
    {
        Cache::forget(self::OTP_PREFIX.$email);
    }

    public function markCooldown(string $email): void
    {
        Cache::put(self::COOLDOWN_PREFIX.$email, now()->timestamp, now()->addSeconds(self::COOLDOWN_TTL));
    }

    public function isCooldownActive(string $email): bool
    {
        return Cache::has(self::COOLDOWN_PREFIX.$email);
    }

    public function getRemainingCooldown(string $email): int
    {
        $stored = Cache::get(self::COOLDOWN_PREFIX.$email);

        if ($stored === null) {
            return 0;
        }

        return max(0, self::COOLDOWN_TTL - (now()->timestamp - $stored));
    }
}
