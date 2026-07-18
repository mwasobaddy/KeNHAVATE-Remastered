<?php

namespace App\Services\Users;

use App\Models\ContractType;
use App\Models\Region;
use App\Models\Staff;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class UserService
{
    public function __construct(
        private AuditService $auditService,
    ) {}

    public function getAll(string $search = '', array $filters = []): LengthAwarePaginator
    {
        return User::with('roles', 'staff')
            ->when($search, fn ($q) => $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('work_email', 'like', "%{$search}%");
            }))
            ->when($filters['role'] ?? null, fn ($q, $role) => $q->whereHas('roles', fn ($q) => $q->where('name', $role))
            )
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->through(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email ?? $user->work_email,
                'role' => $user->roles->first()?->name,
                'is_staff' => $user->staff !== null,
                'created_at' => $user->created_at->toDateString(),
            ]);
    }

    public function getFormData(): array
    {
        return [
            'roles' => Role::whereNull('team_id')->orderBy('name')->get(['id', 'name']),
            'regions' => Region::with('directorates.departments')->orderBy('name')->get(),
            'contractTypes' => ContractType::orderBy('name')->get(['id', 'name']),
        ];
    }

    public function create(User $actor, array $data): array
    {
        $password = $data['password'] ?? str()->random(16);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($password),
            'mobile_number' => $data['mobile_number'] ?? null,
            'gender' => $data['gender'] ?? null,
            'onboarding_completed_at' => now(),
            'terms_accepted' => true,
        ]);

        app(PermissionRegistrar::class)->setPermissionsTeamId(null);
        $user->assignRole($data['role']);

        if (! empty($data['is_staff'])) {
            Staff::create([
                'user_id' => $user->id,
                'region_id' => $data['region_id'] ?? null,
                'directorate_id' => $data['directorate_id'] ?? null,
                'department_id' => $data['department_id'] ?? null,
                'contract_type_id' => $data['contract_type_id'] ?? null,
                'designation' => $data['designation'] ?? null,
            ]);
        }

        $this->auditService->log($actor, 'user_created', "Created user: {$user->name} ({$user->email})");

        return ['user' => $user, 'generated_password' => $data['password'] ? null : $password];
    }

    public function getForEdit(User $user): array
    {
        $user->load('roles', 'staff');

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'mobile_number' => $user->mobile_number,
            'gender' => $user->gender,
            'role' => $user->roles->first()?->name,
            'is_staff' => $user->staff !== null,
            'staff' => $user->staff ? [
                'region_id' => $user->staff->region_id,
                'directorate_id' => $user->staff->directorate_id,
                'department_id' => $user->staff->department_id,
                'contract_type_id' => $user->staff->contract_type_id,
                'designation' => $user->staff->designation,
            ] : null,
        ];
    }

    public function update(User $actor, User $user, array $data): void
    {
        $updateData = [
            'name' => $data['name'],
            'email' => $data['email'],
            'mobile_number' => $data['mobile_number'] ?? null,
            'gender' => $data['gender'] ?? null,
        ];

        if (! empty($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
        }

        $user->update($updateData);

        app(PermissionRegistrar::class)->setPermissionsTeamId(null);
        $user->syncRoles([$data['role']]);

        if (! empty($data['is_staff'])) {
            Staff::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'region_id' => $data['region_id'] ?? null,
                    'directorate_id' => $data['directorate_id'] ?? null,
                    'department_id' => $data['department_id'] ?? null,
                    'contract_type_id' => $data['contract_type_id'] ?? null,
                    'designation' => $data['designation'] ?? null,
                ],
            );
        } else {
            $user->staff()?->delete();
        }

        $this->auditService->log($actor, 'user_updated', "Updated user: {$user->name} ({$user->email})");
    }

    public function delete(User $actor, User $user): void
    {
        $name = $user->name;
        $email = $user->email;
        $user->delete();
        $this->auditService->log($actor, 'user_deleted', "Deleted user: {$name} ({$email})");
    }
}
