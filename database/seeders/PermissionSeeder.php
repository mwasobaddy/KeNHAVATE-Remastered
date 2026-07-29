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
            ['name' => 'idea.view', 'description' => 'Allows viewing idea details. Assigned to all team roles (author, contributor, collaborator).'],
            ['name' => 'idea.create', 'description' => 'Allows submitting new ideas. Assigned to the default user role.'],
            ['name' => 'idea.edit', 'description' => 'Allows editing idea details. Author-only permission.'],
            ['name' => 'idea.delete', 'description' => 'Allows deleting an idea. Author-only permission.'],
            ['name' => 'idea.propose_changes', 'description' => 'Allows proposing changes to an existing idea. Assigned to contributors and collaborators.'],
            ['name' => 'idea.approve_changes', 'description' => 'Allows approving or rejecting proposed changes. Author-only permission.'],
            ['name' => 'idea.view_changes', 'description' => 'Allows viewing change request details. Assigned to anyone who needs visibility into changes.'],
            ['name' => 'idea.manage_contributors', 'description' => 'Allows adding or removing contributors. Author-only permission.'],
            ['name' => 'idea.receive_new_submission_notifications', 'description' => 'Receives notifications when new ideas are submitted.'],
            ['name' => 'idea.assign_officer', 'description' => 'Allows assigning an officer to an idea for review.'],
            ['name' => 'idea.classify', 'description' => 'Allows classifying ideas into IP types and categories.'],
            ['name' => 'idea.record_decision', 'description' => 'Allows recording a DG decision outcome (approved, deferred, declined, etc.) and advancing an idea through execution statuses.'],
            ['name' => 'idea.review', 'description' => 'Allows reviewing and scoring ideas.'],
            ['name' => 'dashboard.view_admin', 'description' => 'Allows viewing the admin tab on the dashboard with system stats and management links.'],
            ['name' => 'points.create', 'description' => 'Allows creating point allocations for users.'],
            ['name' => 'points.edit', 'description' => 'Allows editing existing point allocations.'],
            ['name' => 'points.delete', 'description' => 'Allows deleting point allocations.'],
            ['name' => 'points.view', 'description' => 'Allows viewing point totals and leaderboards.'],
            ['name' => 'audit.view', 'description' => 'Allows viewing the audit log of system activities.'],
            ['name' => 'role.manage', 'description' => 'Allows viewing the list of roles. Typically combined with role.create, role.edit, or role.delete.'],
            ['name' => 'role.create', 'description' => 'Allows creating new roles with custom permission sets.'],
            ['name' => 'role.edit', 'description' => 'Allows editing existing role names and their permissions.'],
            ['name' => 'role.delete', 'description' => 'Allows deleting roles from the system.'],
            ['name' => 'user.manage', 'description' => 'Allows viewing the list of users. Typically combined with user.create, user.edit, or user.delete.'],
            ['name' => 'user.create', 'description' => 'Allows creating new user accounts.'],
            ['name' => 'user.edit', 'description' => 'Allows editing user details and assigned roles.'],
            ['name' => 'user.delete', 'description' => 'Allows deleting user accounts.'],
            ['name' => 'report.manage', 'description' => 'Allows viewing all bug reports submitted by users.'],
            ['name' => 'report.accept', 'description' => 'Allows accepting a bug report as valid.'],
            ['name' => 'report.reject', 'description' => 'Allows rejecting a bug report with a reason.'],
            ['name' => 'report.receive_report_notification', 'description' => 'Receives notifications when a new bug report is submitted.'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission['name'],
                'guard_name' => 'web',
                'description' => $permission['description'],
            ]);
        }

        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->givePermissionTo(Permission::all());
        $admin->revokePermissionTo('idea.approve_changes');

        $user = Role::firstOrCreate(['name' => 'user', 'guard_name' => 'web']);
        $user->givePermissionTo(['idea.create']);
    }
}
