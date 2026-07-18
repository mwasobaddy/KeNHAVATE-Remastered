<?php

namespace App\Services\Roles;

use App\Models\User;
use App\Services\AuditService;
use Illuminate\Pagination\LengthAwarePaginator;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleService
{
    public function __construct(
        private AuditService $auditService,
    ) {}

    public function getAll(string $search = ''): LengthAwarePaginator
    {
        return Role::whereNull('team_id')
            ->withCount('users')
            ->with('permissions')
            ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate(20)
            ->through(fn ($role) => [
                'id' => $role->id,
                'name' => $role->name,
                'guard_name' => $role->guard_name,
                'users_count' => $role->users_count,
                'permissions_count' => $role->permissions->count(),
                'is_protected' => in_array($role->name, ['admin', 'user']),
            ]);
    }

    private const TEAM_PERMISSIONS = [
        'idea.view',
        'idea.edit',
        'idea.delete',
        'idea.propose_changes',
        'idea.approve_changes',
        'idea.view_changes',
        'idea.manage_contributors',
    ];

    public function getFormPermissions(): array
    {
        return Permission::orderBy('name')
            ->whereNotIn('name', self::TEAM_PERMISSIONS)
            ->get(['id', 'name', 'description'])
            ->all();
    }

    public function create(User $user, string $name, array $permissions = []): Role
    {
        $role = Role::create([
            'name' => $name,
            'guard_name' => 'web',
            'team_id' => null,
        ]);

        $role->syncPermissions(collect($permissions)->push('idea.create')->unique()->values()->all());

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

        $role->syncPermissions(collect($permissions)->push('idea.create')->unique()->values()->all());

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
