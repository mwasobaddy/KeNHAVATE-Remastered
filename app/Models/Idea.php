<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class Idea extends Model
{
    protected $fillable = [
        'title',
        'description',
        'author_id',
        'status',
    ];

    protected static function booted(): void
    {
        static::created(function (self $idea) {
            $idea->createTeamRoles();
        });
    }

    public function bootTeamContext(): int|null|string
    {
        $previous = getPermissionsTeamId();
        app(PermissionRegistrar::class)->setPermissionsTeamId($this->id);

        return $previous;
    }

    public function refreshUserTeamContext(User $user): void
    {
        $user->unsetRelation('roles')->unsetRelation('permissions');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function changeRequests(): HasMany
    {
        return $this->hasMany(ChangeRequest::class);
    }

    public function collaborationRequests(): HasMany
    {
        return $this->hasMany(CollaborationRequest::class);
    }

    public function createTeamRoles(): void
    {
        $previous = $this->bootTeamContext();

        $rolePermissions = [
            'author' => [
                'idea.view',
                'idea.edit',
                'idea.delete',
                'idea.propose_changes',
                'idea.approve_changes',
                'idea.manage_contributors',
            ],
            'contributor' => [
                'idea.view',
                'idea.propose_changes',
            ],
            'collaborator' => [
                'idea.view',
            ],
        ];

        foreach ($rolePermissions as $role => $permissions) {
            $role = Role::create(['name' => $role, 'team_id' => $this->id]);
            $role->givePermissionTo($permissions);
        }

        app(PermissionRegistrar::class)->setPermissionsTeamId($previous);
    }

    public function assignRole(User $user, string $role): void
    {
        $previous = $this->bootTeamContext();
        $user->assignRole($role);
        $this->refreshUserTeamContext($user);
        app(PermissionRegistrar::class)->setPermissionsTeamId($previous);
    }

    public function hasUserRole(User $user, string $role): bool
    {
        $previous = $this->bootTeamContext();
        $this->refreshUserTeamContext($user);
        $result = $user->hasRole($role);
        app(PermissionRegistrar::class)->setPermissionsTeamId($previous);

        return $result;
    }

    public function userCan(User $user, string $permission): bool
    {
        $previous = $this->bootTeamContext();
        $this->refreshUserTeamContext($user);
        $result = $user->can($permission);
        app(PermissionRegistrar::class)->setPermissionsTeamId($previous);

        return $result;
    }

    public function removeUser(User $user): void
    {
        $previous = $this->bootTeamContext();
        $this->refreshUserTeamContext($user);
        $user->syncRoles([]);
        app(PermissionRegistrar::class)->setPermissionsTeamId($previous);
    }
}
