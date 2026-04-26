<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Directorate;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            // Information Technology Directorate Departments
            [
                'name' => 'Software Development Department',
                'code' => 'SDD',
                'description' => 'Handles software development and application maintenance',
                'directorate_code' => 'ITD',
                'is_active' => true,
            ],
            [
                'name' => 'Systems Administration Department',
                'code' => 'SAD',
                'description' => 'Manages system infrastructure and network operations',
                'directorate_code' => 'ITD',
                'is_active' => true,
            ],
            [
                'name' => 'Cybersecurity Department',
                'code' => 'CSD',
                'description' => 'Ensures information security and data protection',
                'directorate_code' => 'ITD',
                'is_active' => true,
            ],

            // Human Resources Directorate Departments
            [
                'name' => 'Recruitment Department',
                'code' => 'RD',
                'description' => 'Manages hiring and talent acquisition processes',
                'directorate_code' => 'HRD',
                'is_active' => true,
            ],
            [
                'name' => 'Employee Relations Department',
                'code' => 'ERD',
                'description' => 'Handles employee engagement and workplace relations',
                'directorate_code' => 'HRD',
                'is_active' => true,
            ],

            // Finance Directorate Departments
            [
                'name' => 'Budget Planning Department',
                'code' => 'BPD',
                'description' => 'Manages budget planning and financial forecasting',
                'directorate_code' => 'FD',
                'is_active' => true,
            ],
            [
                'name' => 'Auditing Department',
                'code' => 'AUD',
                'description' => 'Conducts financial audits and compliance checks',
                'directorate_code' => 'FD',
                'is_active' => true,
            ],

            // Infrastructure Directorate Departments
            [
                'name' => 'Roads and Transport Department',
                'code' => 'RTD',
                'description' => 'Manages road infrastructure and transportation systems',
                'directorate_code' => 'ID',
                'is_active' => true,
            ],
            [
                'name' => 'Urban Planning Department',
                'code' => 'UPD',
                'description' => 'Handles urban development and city planning',
                'directorate_code' => 'ID',
                'is_active' => true,
            ],

            // Agriculture Directorate Departments
            [
                'name' => 'Crop Production Department',
                'code' => 'CPD',
                'description' => 'Manages crop farming and agricultural production',
                'directorate_code' => 'AD',
                'is_active' => true,
            ],
            [
                'name' => 'Livestock Department',
                'code' => 'LD',
                'description' => 'Handles livestock farming and animal husbandry',
                'directorate_code' => 'AD',
                'is_active' => true,
            ],

            // Education Directorate Departments
            [
                'name' => 'Curriculum Development Department',
                'code' => 'CDD',
                'description' => 'Develops educational curricula and learning materials',
                'directorate_code' => 'ED',
                'is_active' => true,
            ],
            [
                'name' => 'Teacher Training Department',
                'code' => 'TTD',
                'description' => 'Manages teacher professional development programs',
                'directorate_code' => 'ED',
                'is_active' => true,
            ],

            // Health Directorate Departments
            [
                'name' => 'Public Health Department',
                'code' => 'PHD',
                'description' => 'Manages public health programs and disease prevention',
                'directorate_code' => 'HD',
                'is_active' => true,
            ],
            [
                'name' => 'Medical Services Department',
                'code' => 'MSD',
                'description' => 'Oversees medical facilities and healthcare delivery',
                'directorate_code' => 'HD',
                'is_active' => true,
            ],

            // Economic Development Directorate Departments
            [
                'name' => 'Business Development Department',
                'code' => 'BDD',
                'description' => 'Promotes business growth and entrepreneurship',
                'directorate_code' => 'EDD',
                'is_active' => true,
            ],
            [
                'name' => 'Investment Promotion Department',
                'code' => 'IPD',
                'description' => 'Attracts investments and manages investor relations',
                'directorate_code' => 'EDD',
                'is_active' => true,
            ],
        ];

        foreach ($departments as $departmentData) {
            $directorate = Directorate::where('code', $departmentData['directorate_code'])->first();
            if ($directorate) {
                unset($departmentData['directorate_code']);
                $departmentData['directorate_id'] = $directorate->id;
                Department::create($departmentData);
            }
        }

        $this->command->info('Created '.count($departments).' departments successfully.');
    }
}
