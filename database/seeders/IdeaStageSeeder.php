<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class IdeaStageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $stages = [
            [
                'name' => 'SME',
                'description' => 'SME Review stage',
                'order' => 1,
            ],
            [
                'name' => 'BOARD',
                'description' => 'Board Review stage',
                'order' => 2,
            ],
        ];

        foreach ($stages as $stage) {
            DB::table('idea_stages')->insert([
                'name' => $stage['name'],
                'description' => $stage['description'],
                'order' => $stage['order'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
