<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        setPermissionsTeamId(null);

        $user = User::create([
            'name' => 'Kelvin Ramsiel',
            'email' => 'kelvinramsiel@gmail.com',
            'email_verified_at' => now(),
            'mobile_number' => '+254712345678',
            'gender' => 'Male',
            'password' => Hash::make('password'),
            'terms_accepted' => true,
            'onboarding_completed_at' => now(),
        ]);

        $user->assignRole('admin');

        User::factory(5)->create()->each(fn ($user) => $user->assignRole('user'));
    }
}
