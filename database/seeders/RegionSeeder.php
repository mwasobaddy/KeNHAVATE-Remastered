<?php

namespace Database\Seeders;

use App\Models\Region;
use Illuminate\Database\Seeder;

class RegionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $regions = [
            [
                'name' => 'Nairobi Region',
                'code' => 'NRB',
                'description' => 'Nairobi Metropolitan Region',
                'is_active' => true,
            ],
            [
                'name' => 'Coast Region',
                'code' => 'CST',
                'description' => 'Coastal Region including Mombasa and surrounding areas',
                'is_active' => true,
            ],
            [
                'name' => 'Rift Valley Region',
                'code' => 'RV',
                'description' => 'Rift Valley Region including Nakuru and Eldoret',
                'is_active' => true,
            ],
            [
                'name' => 'Western Region',
                'code' => 'WST',
                'description' => 'Western Region including Kisumu and Kakamega',
                'is_active' => true,
            ],
            [
                'name' => 'Nyanza Region',
                'code' => 'NYZ',
                'description' => 'Nyanza Region including Kisumu and surrounding areas',
                'is_active' => true,
            ],
        ];

        foreach ($regions as $region) {
            Region::create($region);
        }

        $this->command->info('Created '.count($regions).' regions successfully.');
    }
}
