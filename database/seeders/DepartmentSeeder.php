<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Directorate;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['name' => 'Project Planning', 'code' => 'NRB-IP-PP', 'directorate_code' => 'NRB-IP', 'description' => 'Project planning and feasibility studies'],
            ['name' => 'Design & Engineering', 'code' => 'NRB-IP-DE', 'directorate_code' => 'NRB-IP', 'description' => 'Road design and engineering'],
            ['name' => 'Construction', 'code' => 'NRB-RD-CN', 'directorate_code' => 'NRB-RD', 'description' => 'Road construction projects'],
            ['name' => 'Maintenance', 'code' => 'NRB-RD-MT', 'directorate_code' => 'NRB-RD', 'description' => 'Road maintenance and repairs'],
            ['name' => 'Traffic Management', 'code' => 'NRB-UR-TM', 'directorate_code' => 'NRB-UR', 'description' => 'Urban traffic management'],
            ['name' => 'Human Resources', 'code' => 'NRB-CS-HR', 'directorate_code' => 'NRB-CS', 'description' => 'Human resources management'],
            ['name' => 'Finance & Accounting', 'code' => 'NRB-CS-FA', 'directorate_code' => 'NRB-CS', 'description' => 'Financial management and accounting'],
            ['name' => 'Project Planning', 'code' => 'CST-IP-PP', 'directorate_code' => 'CST-IP', 'description' => 'Project planning and feasibility studies'],
            ['name' => 'Design & Engineering', 'code' => 'CST-IP-DE', 'directorate_code' => 'CST-IP', 'description' => 'Road design and engineering'],
            ['name' => 'Construction', 'code' => 'CST-RD-CN', 'directorate_code' => 'CST-RD', 'description' => 'Road construction projects'],
            ['name' => 'Maintenance', 'code' => 'CST-RD-MT', 'directorate_code' => 'CST-RD', 'description' => 'Road maintenance and repairs'],
            ['name' => 'Marine Operations', 'code' => 'CST-MF-MO', 'directorate_code' => 'CST-MF', 'description' => 'Marine operations and logistics'],
            ['name' => 'Ferry Services', 'code' => 'CST-MF-FS', 'directorate_code' => 'CST-MF', 'description' => 'Ferry services management'],
            ['name' => 'Human Resources', 'code' => 'CST-CS-HR', 'directorate_code' => 'CST-CS', 'description' => 'Human resources management'],
            ['name' => 'Finance & Accounting', 'code' => 'CST-CS-FA', 'directorate_code' => 'CST-CS', 'description' => 'Financial management and accounting'],
            ['name' => 'Project Planning', 'code' => 'RV-IP-PP', 'directorate_code' => 'RV-IP', 'description' => 'Project planning and feasibility studies'],
            ['name' => 'Design & Engineering', 'code' => 'RV-IP-DE', 'directorate_code' => 'RV-IP', 'description' => 'Road design and engineering'],
            ['name' => 'Construction', 'code' => 'RV-RD-CN', 'directorate_code' => 'RV-RD', 'description' => 'Road construction projects'],
            ['name' => 'Maintenance', 'code' => 'RV-RD-MT', 'directorate_code' => 'RV-RD', 'description' => 'Road maintenance and repairs'],
            ['name' => 'Human Resources', 'code' => 'RV-CS-HR', 'directorate_code' => 'RV-CS', 'description' => 'Human resources management'],
            ['name' => 'Finance & Accounting', 'code' => 'RV-CS-FA', 'directorate_code' => 'RV-CS', 'description' => 'Financial management and accounting'],
            ['name' => 'Project Planning', 'code' => 'WST-IP-PP', 'directorate_code' => 'WST-IP', 'description' => 'Project planning and feasibility studies'],
            ['name' => 'Design & Engineering', 'code' => 'WST-IP-DE', 'directorate_code' => 'WST-IP', 'description' => 'Road design and engineering'],
            ['name' => 'Construction', 'code' => 'WST-RD-CN', 'directorate_code' => 'WST-RD', 'description' => 'Road construction projects'],
            ['name' => 'Maintenance', 'code' => 'WST-RD-MT', 'directorate_code' => 'WST-RD', 'description' => 'Road maintenance and repairs'],
            ['name' => 'Human Resources', 'code' => 'WST-CS-HR', 'directorate_code' => 'WST-CS', 'description' => 'Human resources management'],
            ['name' => 'Finance & Accounting', 'code' => 'WST-CS-FA', 'directorate_code' => 'WST-CS', 'description' => 'Financial management and accounting'],
            ['name' => 'Project Planning', 'code' => 'NYZ-IP-PP', 'directorate_code' => 'NYZ-IP', 'description' => 'Project planning and feasibility studies'],
            ['name' => 'Design & Engineering', 'code' => 'NYZ-IP-DE', 'directorate_code' => 'NYZ-IP', 'description' => 'Road design and engineering'],
            ['name' => 'Construction', 'code' => 'NYZ-RD-CN', 'directorate_code' => 'NYZ-RD', 'description' => 'Road construction projects'],
            ['name' => 'Maintenance', 'code' => 'NYZ-RD-MT', 'directorate_code' => 'NYZ-RD', 'description' => 'Road maintenance and repairs'],
            ['name' => 'Human Resources', 'code' => 'NYZ-CS-HR', 'directorate_code' => 'NYZ-CS', 'description' => 'Human resources management'],
            ['name' => 'Finance & Accounting', 'code' => 'NYZ-CS-FA', 'directorate_code' => 'NYZ-CS', 'description' => 'Financial management and accounting'],
        ];

        $directorates = Directorate::pluck('id', 'code');

        foreach ($departments as $department) {
            Department::create([
                'name' => $department['name'],
                'code' => $department['code'],
                'description' => $department['description'],
                'directorate_id' => $directorates[$department['directorate_code']],
                'created_by' => 1,
            ]);
        }

        $this->command->info('Created '.count($departments).' departments successfully.');
    }
}
