<?php

namespace App\Services\Onboarding;

use App\Models\Department;
use App\Models\Region;
use App\Models\User;
use App\Notifications\VerifyWorkEmail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class OnboardingService
{
    /**
     * Update user personal information (step 1).
     */
    public function updateStep1(User $user, array $data, ?string $avatarPath): void
    {
        if ($avatarPath) {
            $this->handleAvatarUpload($user, $avatarPath);
            $data['avatar'] = $avatarPath;
        }

        $user->update($data);
    }

    /**
     * Update user security settings (step 2).
     */
    public function updateStep2(User $user, array $data): void
    {
        $updateData = [
            'is_staff' => $data['is_staff'] ?? false,
        ];

        if (! empty($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
        }

        $user->update($updateData);
    }

    /**
     * Update staff details (step 3).
     */
    public function updateStep3(User $user, array $data): void
    {
        $user->update([
            'department_id' => $data['department_id'],
            'employment_type' => $data['employment_type'],
            'is_staff' => true,
        ]);

        if (isset($data['email'])) {
            $user->update(['email' => $data['email']]);
        }

        if (isset($data['work_email'])) {
            $user->update(['work_email' => $data['work_email']]);
        }

        // Assign staff role for users with work email (@kenha.co.ke)
        if ($user->work_email && str_ends_with($user->work_email, '@kenha.co.ke')) {
            $user->syncRoles(['staff']);
        }
    }

    /**
     * Mark onboarding as completed.
     */
    public function completeOnboarding(User $user): void
    {
        $user->update(['onboarding_completed' => true]);
    }

    /**
     * Get data needed for step 3.
     */
    public function getStep3Data(User $user): array
    {
        $regions = Region::where('is_active', true)
            ->with(['directorates' => function ($query) {
                $query->where('is_active', true)->with(['departments' => function ($query) {
                    $query->where('is_active', true);
                }]);
            }])
            ->get();

        $currentRegionId = null;
        $currentDirectorateId = null;

        if ($user->department_id) {
            $department = Department::find($user->department_id);
            if ($department && $department->directorate) {
                $currentDirectorateId = $department->directorate_id;
                if ($department->directorate->region) {
                    $currentRegionId = $department->directorate->region_id;
                }
            }
        }

        $isKenhaEmail = ! empty($user->work_email) && str_ends_with($user->work_email, '@kenha.co.ke');

        return [
            'regions' => $regions,
            'currentRegionId' => $currentRegionId,
            'currentDirectorateId' => $currentDirectorateId,
            'isKenhaEmail' => $isKenhaEmail,
        ];
    }

    /**
     * Check if user is a Kenha email user.
     */
    public function isKenhaEmailUser(User $user): bool
    {
        return ! empty($user->work_email) && str_ends_with($user->work_email, '@kenha.co.ke');
    }

    /**
     * Handle avatar upload.
     */
    private function handleAvatarUpload(User $user, string $avatarPath): void
    {
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }
    }

    /**
     * Send appropriate verification notification based on which email was just provided.
     *
     * @param  string  $verificationType  'work_email' or 'email'
     */
    public function sendVerificationNotification(User $user, string $verificationType): string
    {
        if ($verificationType === 'email') {
            // User just provided their personal email - verify that
            $user->sendEmailVerificationNotification();

            return 'verification.notice';
        }

        // User just provided their work email - verify work email
        $user->notify(new VerifyWorkEmail);

        return 'work-email.verify.show';
    }
}
