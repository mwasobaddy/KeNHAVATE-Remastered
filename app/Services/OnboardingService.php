<?php

namespace App\Services;

use App\Models\ContractType;
use App\Models\Point;
use App\Models\Region;
use App\Models\User;
use App\Services\Ideas\InvitationService;
use App\Services\Points\PointAwardService;
use Illuminate\Support\Facades\Hash;

class OnboardingService
{
    public function __construct(
        private AuditService $auditService,
    ) {}

    public function getFormData(User $user): array
    {
        return [
            'regions' => Region::with('directorates.departments')->get(),
            'contractTypes' => ContractType::all(),
            'login_email' => $user->email,
            'auto_staff' => ! is_null($user->work_email),
        ];
    }

    public function complete(User $user, array $data): ?string
    {
        $updateData = [
            'name' => trim($data['first_name'].' '.($data['other_names'] ?? '')),
            'mobile_number' => $data['mobile_number'],
            'gender' => $data['gender'],
            'password' => Hash::make($data['password']),
            'onboarding_completed_at' => now(),
        ];

        if (! empty($data['email'])) {
            $updateData['email'] = $data['email'];
        }

        $user->update($updateData);

        $isStaff = ($data['is_staff'] ?? false) || ! is_null($user->work_email);

        if ($isStaff) {
            $user->staff()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'region_id' => $data['region_id'],
                    'directorate_id' => $data['directorate_id'],
                    'department_id' => $data['department_id'],
                    'contract_type_id' => $data['contract_type_id'],
                    'designation' => $data['designation'],
                ],
            );
        }

        setPermissionsTeamId(null);
        $user->assignRole('user');

        $newAccount = Point::where('name', 'New Account')
            ->where('is_active', true)
            ->first();

        if ($newAccount) {
            app(PointAwardService::class)->award($user, $newAccount);
        }

        $redirectUrl = $this->processPendingInvitations($user);

        $this->auditService->log($user, 'onboarding_completed', 'Completed onboarding profile');

        return $redirectUrl;
    }

    protected function processPendingInvitations(User $user): ?string
    {
        $emails = array_filter([$user->email, $user->work_email ?? null]);

        $invitationService = app(InvitationService::class);

        foreach ($emails as $email) {
            $invitation = $invitationService->getPendingForEmail($email);

            if (! $invitation) {
                continue;
            }

            $invitationService->accept($invitation, $user);

            $point = Point::where('name', 'Idea Submission')
                ->where('is_active', true)
                ->first();

            if ($point) {
                app(PointAwardService::class)->award($user, $point);
            }

            return route('ideas.show', $invitation->idea->slug);
        }

        return null;
    }
}
