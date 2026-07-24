<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Socialite\Contracts\User as SocialiteUser;

class GoogleAuthService
{
    public function __construct(
        private AuditService $auditService,
    ) {}

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

            $this->auditService->log($user, 'account_created', "Account created via Google for {$googleUser->getEmail()}");
        }

        $this->saveGoogleAvatar($user, $googleUser);

        // nullify the terms_accepted column
        if ($user) {
            $user->forceFill(['terms_accepted' => false])->save();
        }

        $this->auditService->log($user, 'login', "Logged in via Google ({$googleUser->getEmail()})");

        return $user;
    }

    private function saveGoogleAvatar(User $user, SocialiteUser $googleUser): void
    {
        $avatarUrl = $googleUser->getAvatar();

        if (! $avatarUrl) {
            return;
        }

        try {
            $response = Http::timeout(5)->get($avatarUrl);

            if ($response->successful()) {
                $extension = 'jpg';
                $path = 'avatars/google-'.$user->id.'-'.Str::random(8).'.'.$extension;

                if ($user->avatar) {
                    Storage::disk('public')->delete($user->avatar);
                }

                Storage::disk('public')->put($path, $response->body());
                $user->forceFill(['avatar' => $path])->save();
            }
        } catch (\Exception) {
            // Silently fail — avatar is not critical
        }
    }
}
