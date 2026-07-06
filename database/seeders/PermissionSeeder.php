<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'idea.view',
            'idea.create',
            'idea.edit',
            'idea.delete',
            'idea.propose_changes',
            'idea.approve_changes',
            'idea.manage_contributors',
            'idea.receive_new_submission_notifications',
            'idea.assign_officer',
            'idea.classify',
            'idea.dg_decision',
            'idea.review',
            'points.create',
            'points.edit',
            'points.delete',
            'points.view',
            'audit.view',
            'role.manage',
            'role.create',
            'role.edit',
            'role.delete',
            'user.manage',
            'user.create',
            'user.edit',
            'user.delete',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->givePermissionTo(Permission::all());

        $user = Role::firstOrCreate(['name' => 'user', 'guard_name' => 'web']);
        $user->givePermissionTo(['idea.create']);
    }
}
