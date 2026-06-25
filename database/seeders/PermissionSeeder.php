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
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->givePermissionTo(Permission::all());

        $board = Role::firstOrCreate(['name' => 'board', 'guard_name' => 'web']);
        $board->givePermissionTo(['idea.view', 'idea.approve_changes']);

        $user = Role::firstOrCreate(['name' => 'user', 'guard_name' => 'web']);
        $user->givePermissionTo(['idea.create']);
    }
}
