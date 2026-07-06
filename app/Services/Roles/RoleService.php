<?php

namespace App\Services\Roles;

use App\Models\User;
use App\Services\AuditService;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleService
{
    public function __construct(
        private AuditService $auditService,
    ) {}

    public function getAll(): array
    {
        return Role::whereNull('team_id')
            ->withCount('users')
            ->with('permissions')
            ->get()
            ->map(fn ($role) => [
                'id' => $role->id,
                'name' => $role->name,
                'guard_name' => $role->guard_name,
                'users_count' => $role->users_count,
                'permissions_count' => $role->permissions->count(),
                'is_protected' => in_array($role->name, ['admin', 'user']),
            ])
            ->all();
    }

    public function getFormPermissions(): array
    {
        return Permission::orderBy('name')->get(['id', 'name'])->all();
    }

    public function create(User $user, string $name, array $permissions = []): Role
    {
        $role = Role::create([
            'name' => $name,
            'guard_name' => 'web',
            'team_id' => null,
        ]);

        if (! empty($permissions)) {
            $role->syncPermissions($permissions);
        }

        $this->auditService->log($user, 'role_created', "Created role: {$role->name}");

        return $role;
    }

    public function getForEdit(Role $role): array
    {
        if ($role->team_id !== null) {
            abort(404);
        }

        $role->load('permissions');

        return [
            'id' => $role->id,
            'name' => $role->name,
            'guard_name' => $role->guard_name,
            'is_protected' => in_array($role->name, ['admin', 'user']),
            'permission_names' => $role->permissions->pluck('name'),
        ];
    }

    public function update(User $user, Role $role, string $name, array $permissions = []): string
    {
        if ($role->team_id !== null) {
            abort(404);
        }

        $protected = in_array($role->name, ['admin', 'user']);

        if (! $protected) {
            $role->update(['name' => $name]);
        }

        if (! empty($permissions)) {
            $role->syncPermissions($permissions);
        }

        $this->auditService->log($user, 'role_updated', "Updated role: {$role->name}");

        return $protected ? $role->getOriginal('name') : $name;
    }

    public function delete(User $user, Role $role): void
    {
        $name = $role->name;
        $role->delete();
        $this->auditService->log($user, 'role_deleted', "Deleted role: {$name}");
    }

    public function isProtected(Role $role): bool
    {
        return in_array($role->name, ['admin', 'user']);
    }
}
