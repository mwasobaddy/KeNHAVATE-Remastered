<?php

namespace Database\Seeders;

use App\Models\IdeaClassification;
use Illuminate\Database\Seeder;

class IdeaClassificationSeeder extends Seeder
{
    public function run(): void
    {
        $classifications = [
            [
                'name' => 'Innovation',
                'slug' => 'innovation',
                'description' => 'Small-scale, testable idea within KeNHA control',
            ],
            [
                'name' => 'Research',
                'slug' => 'research',
                'description' => 'Idea requiring testing, evidence, or standards input',
            ],
            [
                'name' => 'Project',
                'slug' => 'project',
                'description' => 'Capital intensive, system-wide, requiring Management or Board direction',
            ],
            [
                'name' => 'Outside Mandate',
                'slug' => 'outside_mandate',
                'description' => 'Idea not falling within KeNHA\'s statutory functions',
            ],
        ];

        foreach ($classifications as $classification) {
            IdeaClassification::firstOrCreate(
                ['slug' => $classification['slug']],
                array_merge($classification, ['created_by' => 1]),
            );
        }
    }
}
