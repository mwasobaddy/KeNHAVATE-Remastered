<?php

namespace App\Services;

use App\Models\ContractType;
use App\Models\Region;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class OnboardingService
{
    public function getFormData(User $user): array
    {
        return [
            'regions' => Region::with('directorates.departments')->get(),
            'contractTypes' => ContractType::all(),
            'auto_staff' => ! is_null($user->work_email),
        ];
    }

    public function complete(User $user, array $data): void
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
    }
}
