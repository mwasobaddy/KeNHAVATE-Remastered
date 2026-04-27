<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define custom permissions
        $permissions = [
            // User management
            'view users',
            'create users',
            'edit users',
            'delete users',

            // Department management
            'view departments',
            'create departments',
            'edit departments',
            'delete departments',

            // Directorate management
            'view directorates',
            'create directorates',
            'edit directorates',
            'delete directorates',

            // Region management
            'view regions',
            'create regions',
            'edit regions',
            'delete regions',

            // Onboarding
            'view onboarding',
            'edit onboarding',
            'skip onboarding',

            // Profile management
            'view profile',
            'edit profile',
            'delete profile',

            // Settings
            'view settings',
            'edit settings',

            // Content/approval workflows
            'view ideas',
            'create ideas',
            'edit ideas',
            'delete ideas',
            'review ideas',
            'approve ideas',
            'reject ideas',

            // Challenges
            'view challenges',
            'create challenges',
            'edit challenges',
            'delete challenges',
            'review challenges',
            'approve challenges',
            'reject challenges',

            // Board operations
            'view board dashboard',
            'view reports',
            'view analytics',
            'manage board members',

            // System administration
            'view system',
            'manage system',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Create roles with specific permissions

        // 1. User (basic authenticated user)
        $userRole = Role::firstOrCreate(['name' => 'user', 'guard_name' => 'web']);
        $userRole->syncPermissions([
            'view profile',
            'edit profile',
            'view onboarding',
            'edit onboarding',
            'skip onboarding',
            'view ideas',
            'create ideas',
            'edit ideas',
            'view challenges',
        ]);

        // 2. Staff (same permissions as user)
        $staffRole = Role::firstOrCreate(['name' => 'staff', 'guard_name' => 'web']);
        $staffRole->syncPermissions([
            'view profile',
            'edit profile',
            'view onboarding',
            'edit onboarding',
            'skip onboarding',
            'view ideas',
            'create ideas',
            'edit ideas',
            'view challenges',
        ]);

        // 3. Idea Reviewer
        $ideaReviewerRole = Role::firstOrCreate(['name' => 'idea_reviewer', 'guard_name' => 'web']);
        $ideaReviewerRole->syncPermissions([
            'view users',
            'view departments',
            'view directorates',
            'view regions',
            'view profile',
            'edit profile',
            'view ideas',
            'review ideas',
            'approve ideas',
            'reject ideas',
            'view challenges',
        ]);

        // 3. Deputy Director
        $deputyDirectorRole = Role::firstOrCreate(['name' => 'deputy_director', 'guard_name' => 'web']);
        $deputyDirectorRole->syncPermissions([
            'view users',
            'create users',
            'edit users',
            'view departments',
            'edit departments',
            'view directorates',
            'edit directorates',
            'view regions',
            'view profile',
            'edit profile',
            'view onboarding',
            'view ideas',
            'edit ideas',
            'review ideas',
            'approve ideas',
            'reject ideas',
            'view challenges',
            'edit challenges',
            'review challenges',
            'view reports',
            'view analytics',
        ]);

        // 4. Challenge Reviewer
        $challengeReviewerRole = Role::firstOrCreate(['name' => 'challenge_reviewer', 'guard_name' => 'web']);
        $challengeReviewerRole->syncPermissions([
            'view users',
            'view departments',
            'view directorates',
            'view regions',
            'view profile',
            'edit profile',
            'view ideas',
            'view challenges',
            'review challenges',
            'approve challenges',
            'reject challenges',
            'view reports',
        ]);

        // 5. Board
        $boardRole = Role::firstOrCreate(['name' => 'board', 'guard_name' => 'web']);
        $boardRole->syncPermissions([
            'view users',
            'view departments',
            'view directorates',
            'view regions',
            'view profile',
            'view onboarding',
            'view ideas',
            'view challenges',
            'view board dashboard',
            'view reports',
            'view analytics',
            'manage board members',
        ]);

        // 6. Developer
        $developerRole = Role::firstOrCreate(['name' => 'developer', 'guard_name' => 'web']);
        $developerRole->syncPermissions([
            'view users',
            'create users',
            'edit users',
            'delete users',
            'view departments',
            'create departments',
            'edit departments',
            'delete departments',
            'view directorates',
            'create directorates',
            'edit directorates',
            'delete directorates',
            'view regions',
            'create regions',
            'edit regions',
            'delete regions',
            'view profile',
            'edit profile',
            'delete profile',
            'view settings',
            'edit settings',
            'view system',
            'manage system',
            'view ideas',
            'create ideas',
            'edit ideas',
            'delete ideas',
            'review ideas',
            'approve ideas',
            'reject ideas',
            'view challenges',
            'create challenges',
            'edit challenges',
            'delete challenges',
            'review challenges',
            'approve challenges',
            'reject challenges',
            'view board dashboard',
            'view reports',
            'view analytics',
        ]);

        $this->command->info('Roles and permissions created successfully.');
    }
}
