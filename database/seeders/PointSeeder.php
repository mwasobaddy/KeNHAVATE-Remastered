<?php

namespace Database\Seeders;

use App\Models\Point;
use Illuminate\Database\Seeder;

class PointSeeder extends Seeder
{
    public function run(): void
    {
        $pointsData = [
            [
                'name' => 'New Account',
                'description' => 'Points awarded for creating a new account and completing onboarding.',
                'points' => 100,
                'is_active' => true,
            ],
            [
                'name' => 'Daily Login',
                'description' => 'Points awarded for logging in each day.',
                'points' => 10,
                'is_active' => true,
            ],
            [
                'name' => 'Idea Submission',
                'description' => 'Points awarded to each contributor for submitting a new idea.',
                'points' => 50,
                'is_active' => true,
            ],
            [
                'name' => 'Bug Bounty',
                'description' => 'Points awarded when a submitted bug report is accepted as valid.',
                'points' => 20,
                'is_active' => true,
            ],
        ];

        foreach ($pointsData as $point) {
            Point::firstOrCreate(
                ['name' => $point['name']],
                array_merge($point, ['created_by' => 1]),
            );
        }
    }
}
