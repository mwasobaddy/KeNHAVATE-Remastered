<?php

namespace Database\Seeders;

use App\Models\Directorate;
use App\Models\Region;
use Illuminate\Database\Seeder;

class DirectorateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $directorates = [
            // Nairobi Region Directorates
            [
                'name' => 'Information Technology Directorate',
                'code' => 'ITD',
                'description' => 'Responsible for all IT infrastructure and digital services',
                'region_code' => 'NRB',
                'is_active' => true,
            ],
            [
                'name' => 'Human Resources Directorate',
                'code' => 'HRD',
                'description' => 'Manages human resources and personnel matters',
                'region_code' => 'NRB',
                'is_active' => true,
            ],
            [
                'name' => 'Finance Directorate',
                'code' => 'FD',
                'description' => 'Handles financial planning and budget management',
                'region_code' => 'NRB',
                'is_active' => true,
            ],

            // Coast Region Directorates
            [
                'name' => 'Infrastructure Directorate',
                'code' => 'ID',
                'description' => 'Manages infrastructure development and maintenance',
                'region_code' => 'CST',
                'is_active' => true,
            ],
            [
                'name' => 'Maritime Directorate',
                'code' => 'MD',
                'description' => 'Oversees maritime affairs and port operations',
                'region_code' => 'CST',
                'is_active' => true,
            ],

            // Rift Valley Region Directorates
            [
                'name' => 'Agriculture Directorate',
                'code' => 'AD',
                'description' => 'Manages agricultural development and food security',
                'region_code' => 'RV',
                'is_active' => true,
            ],
            [
                'name' => 'Tourism Directorate',
                'code' => 'TD',
                'description' => 'Promotes tourism and cultural heritage',
                'region_code' => 'RV',
                'is_active' => true,
            ],

            // Western Region Directorates
            [
                'name' => 'Education Directorate',
                'code' => 'ED',
                'description' => 'Oversees educational institutions and programs',
                'region_code' => 'WST',
                'is_active' => true,
            ],
            [
                'name' => 'Health Directorate',
                'code' => 'HD',
                'description' => 'Manages healthcare services and facilities',
                'region_code' => 'WST',
                'is_active' => true,
            ],

            // Nyanza Region Directorates
            [
                'name' => 'Economic Development Directorate',
                'code' => 'EDD',
                'description' => 'Promotes economic growth and development',
                'region_code' => 'NYZ',
                'is_active' => true,
            ],
            [
                'name' => 'Environmental Directorate',
                'code' => 'EVD',
                'description' => 'Manages environmental conservation and protection',
                'region_code' => 'NYZ',
                'is_active' => true,
            ],
        ];

        foreach ($directorates as $directorateData) {
            $region = Region::where('code', $directorateData['region_code'])->first();
            if ($region) {
                unset($directorateData['region_code']);
                $directorateData['region_id'] = $region->id;
                Directorate::create($directorateData);
            }
        }

        $this->command->info('Created '.count($directorates).' directorates successfully.');
    }
}
