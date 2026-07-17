<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PermissionSeeder::class,
            UserSeeder::class,
            RegionSeeder::class,
            DirectorateSeeder::class,
            DepartmentSeeder::class,
            ContractTypeSeeder::class,
            PointSeeder::class,
            IdeaCategorySeeder::class,
            IdeaClassificationSeeder::class,
            IdeaDemoSeeder::class,
        ]);
    }
}
