<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Clear existing users to avoid conflicts
        DB::table('users')->truncate();
        
        // Get department IDs for assignment
        $departmentIds = DB::table('departments')->pluck('id')->toArray();
        
        // Create 15 users with specific emails
        $emails = [
            ['type' => 'personal', 'email' => 'kelvinramsiel@gmail.com'],
            ['type' => 'work', 'email' => 'innovations@kenha.co.ke'],
        ];
        
        for ($i = 0; $i < 13; $i++) {
            $emails[] = ['type' => 'personal', 'email' => "user{$i}@example.com"];
        }

        $users = [];
        foreach ($emails as $emailData) {
            $fullName = $this->generateName($emailData['email']);
            $parts = explode(' ', $fullName);
            $firstName = $parts[0];
            $otherNames = implode(' ', array_slice($parts, 1));
            
            $userData = [
                'first_name' => $firstName,
                'other_names' => $otherNames,
                'mobile_number' => '07' . rand(100000000, 999999999),
                'password' => Hash::make(Str::random(8)),
                'remember_token' => Str::random(10),
                // Avatar as a https link to images
                'avatar' => 'https://placehold.net/avatar.png',
                // Set onboarding as completed for seeded users
                'onboarding_completed' => true,
                // Read terms as true
                'read_terms' => true,
                // Random employment type
                'employment_type' => ['full_time', 'part_time', 'contract'][rand(0, 2)],
                // Gender
                'gender' => ['male', 'female'][rand(0, 1)],
                // Assign random department
                'department_id' => $departmentIds[array_rand($departmentIds)],
                // Email verification (randomly set some as verified)
                'email_verified_at' => rand(0, 1) ? now() : null,
                'work_email_verified_at' => rand(0, 1) ? now() : null,
            ];
            
            // Assign email or work_email based on type
            if ($emailData['type'] === 'personal') {
                $userData['email'] = $emailData['email'];
                // Work email can be null or a different email for personal users
                if (rand(0, 1)) {
                    $userData['work_email'] = "work." . $emailData['email'];
                }
            } else {
                $userData['work_email'] = $emailData['email'];
                // Personal email can be null or a different email for work users
                if (rand(0, 1)) {
                    $userData['email'] = "personal." . $emailData['email'];
                }
            }
            
            $user = User::create($userData);
            $users[] = $user;
        }
    }

    private function generateName($email)
    {
        if (str_contains($email, 'kelvin')) {
            return 'Kelvin Ramsiel';
        } elseif (str_contains($email, 'innovations')) {
            return 'Innovation Team';
        }
        return 'User ' . rand(1, 100);
    }
}