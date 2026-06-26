<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Contracts\User as SocialiteUser;

class GoogleAuthService
{
    public function findOrCreateUser(SocialiteUser $googleUser): User
    {
        $isKenha = str_ends_with($googleUser->getEmail(), '@kenha.co.ke');

        $user = User::where('google_id', $googleUser->getId())->first();

        if (! $user) {
            $user = User::where('email', $googleUser->getEmail())
                ->orWhere('work_email', $googleUser->getEmail())
                ->first();
        }

        if ($user) {
            $user->forceFill(['google_id' => $googleUser->getId()])->save();
        } else {
            $user = User::create([
                'name' => $googleUser->getName() ?? Str::before($googleUser->getEmail(), '@'),
                'email' => $isKenha ? null : $googleUser->getEmail(),
                'work_email' => $isKenha ? $googleUser->getEmail() : null,
                'google_id' => $googleUser->getId(),
                'email_verified_at' => now(),
                'password' => Hash::make(Str::random(32)),
            ]);
        }

        // nullify the terms_accepted column
        if ($user) {
            $user->forceFill(['terms_accepted' => false])->save();
        }

        return $user;
    }
}
