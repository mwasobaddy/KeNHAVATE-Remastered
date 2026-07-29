<?php

namespace Database\Seeders;

use App\Models\ContractType;
use Illuminate\Database\Seeder;

class ContractTypeSeeder extends Seeder
{
    public function run(): void
    {
        $contractTypes = [
            ['name' => 'Permanent & Pensionable', 'description' => 'Permanent employment with pension benefits'],
            ['name' => 'Contract', 'description' => 'Fixed-term contract employment'],
            ['name' => 'Secondment', 'description' => 'Employee seconded from another organization'],
            ['name' => 'Internship', 'description' => 'Internship program for recent graduates'],
            ['name' => 'Attachment', 'description' => 'Student attachment / industrial attachment'],
        ];

        foreach ($contractTypes as $type) {
            ContractType::create(array_merge($type, ['created_by' => 1]));
        }

        $this->command->info('Created '.count($contractTypes).' contract types successfully.');
    }
}
