<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

#[Signature('deploy:migrate-fresh')]
#[Description('Drop all tables, re-run migrations and seed the database, even in production')]
class DeployMigrateFresh extends Command
{
    public function handle(): int
    {
        DB::prohibitDestructiveCommands(false);

        try {
            $exitCode = $this->call('migrate:fresh', ['--seed' => true, '--force' => true]);

            return $exitCode === self::SUCCESS ? self::SUCCESS : self::FAILURE;
        } finally {
            DB::prohibitDestructiveCommands($this->laravel->isProduction());
        }
    }
}
