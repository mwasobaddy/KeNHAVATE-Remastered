<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class Idea extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'category_id',
        'author_id',
        'problem_statement',
        'proposed_solution',
        'cost_benefit_analysis',
        'collaboration_enabled',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'collaboration_enabled' => 'boolean',
        ];
    }

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

    public function category(): BelongsTo
    {
        return $this->belongsTo(IdeaCategory::class, 'category_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(IdeaDocument::class);
    }

    public function changeRequests(): HasMany
    {
        return $this->hasMany(ChangeRequest::class);
    }

    public function collaborationRequests(): HasMany
    {
        return $this->hasMany(CollaborationRequest::class);
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(IdeaInvitation::class);
    }

    public function ipRight(): HasOne
    {
        return $this->hasOne(IdeaIpRight::class);
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
                'idea.propose_changes',
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
