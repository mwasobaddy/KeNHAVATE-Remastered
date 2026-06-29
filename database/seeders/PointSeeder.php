<?php

namespace Database\Seeders;

use App\Models\Point;
use Illuminate\Database\Seeder;

class PointSeeder extends Seeder
{
    public function run(): void
    {
        Point::firstOrCreate(
            ['name' => 'New Account'],
            [
                'description' => 'Points awarded for creating a new account and completing onboarding.',
                'points' => 100,
                'is_active' => true,
            ],
        );

        Point::firstOrCreate(
            ['name' => 'Daily Login'],
            [
                'description' => 'Points awarded for logging in each day.',
                'points' => 10,
                'is_active' => true,
            ],
        );

        Point::firstOrCreate(
            ['name' => 'Idea Submission'],
            [
                'description' => 'Points awarded to each contributor for submitting a new idea.',
                'points' => 50,
                'is_active' => true,
            ],
        );
    }
}
