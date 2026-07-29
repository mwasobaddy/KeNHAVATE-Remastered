<?php

namespace Database\Seeders;

use App\Models\Directorate;
use App\Models\Region;
use Illuminate\Database\Seeder;

class DirectorateSeeder extends Seeder
{
    public function run(): void
    {
        $directorates = [
            ['name' => 'Infrastructure Planning', 'code' => 'NRB-IP', 'region_code' => 'NRB', 'description' => 'Infrastructure planning and design for Nairobi region'],
            ['name' => 'Road Development', 'code' => 'NRB-RD', 'region_code' => 'NRB', 'description' => 'Road construction and development for Nairobi region'],
            ['name' => 'Urban Roads Management', 'code' => 'NRB-UR', 'region_code' => 'NRB', 'description' => 'Urban roads management for Nairobi region'],
            ['name' => 'Corporate Services', 'code' => 'NRB-CS', 'region_code' => 'NRB', 'description' => 'Corporate services and administration for Nairobi region'],
            ['name' => 'Infrastructure Planning', 'code' => 'CST-IP', 'region_code' => 'CST', 'description' => 'Infrastructure planning and design for Coast region'],
            ['name' => 'Road Development', 'code' => 'CST-RD', 'region_code' => 'CST', 'description' => 'Road construction and development for Coast region'],
            ['name' => 'Marine & Ferry Services', 'code' => 'CST-MF', 'region_code' => 'CST', 'description' => 'Marine and ferry services management for Coast region'],
            ['name' => 'Corporate Services', 'code' => 'CST-CS', 'region_code' => 'CST', 'description' => 'Corporate services and administration for Coast region'],
            ['name' => 'Infrastructure Planning', 'code' => 'RV-IP', 'region_code' => 'RV', 'description' => 'Infrastructure planning and design for Rift Valley region'],
            ['name' => 'Road Development', 'code' => 'RV-RD', 'region_code' => 'RV', 'description' => 'Road construction and development for Rift Valley region'],
            ['name' => 'Corporate Services', 'code' => 'RV-CS', 'region_code' => 'RV', 'description' => 'Corporate services and administration for Rift Valley region'],
            ['name' => 'Infrastructure Planning', 'code' => 'WST-IP', 'region_code' => 'WST', 'description' => 'Infrastructure planning and design for Western region'],
            ['name' => 'Road Development', 'code' => 'WST-RD', 'region_code' => 'WST', 'description' => 'Road construction and development for Western region'],
            ['name' => 'Corporate Services', 'code' => 'WST-CS', 'region_code' => 'WST', 'description' => 'Corporate services and administration for Western region'],
            ['name' => 'Infrastructure Planning', 'code' => 'NYZ-IP', 'region_code' => 'NYZ', 'description' => 'Infrastructure planning and design for Nyanza region'],
            ['name' => 'Road Development', 'code' => 'NYZ-RD', 'region_code' => 'NYZ', 'description' => 'Road construction and development for Nyanza region'],
            ['name' => 'Corporate Services', 'code' => 'NYZ-CS', 'region_code' => 'NYZ', 'description' => 'Corporate services and administration for Nyanza region'],
        ];

        $regions = Region::pluck('id', 'code');

        foreach ($directorates as $directorate) {
            Directorate::create([
                'name' => $directorate['name'],
                'code' => $directorate['code'],
                'description' => $directorate['description'],
                'region_id' => $regions[$directorate['region_code']],
                'created_by' => 1,
            ]);
        }

        $this->command->info('Created '.count($directorates).' directorates successfully.');
    }
}
