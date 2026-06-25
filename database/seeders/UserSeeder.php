<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        setPermissionsTeamId(1);

        $admin = User::create([
            'name' => 'Kelvin Ramsiel',
            'email' => 'kelvinramsiel@gmail.com',
            'email_verified_at' => now(),
            'mobile_number' => '+254712345678',
            'gender' => 'male',
            'password' => Hash::make('password'),
        ]);

        $admin->assignRole('admin');

        User::factory(5)->create()->each(fn ($user) => $user->assignRole('user'));
    }
}
