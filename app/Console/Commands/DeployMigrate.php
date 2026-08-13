<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('deploy:migrate')]
#[Description('Run pending database migrations, even in production')]
class DeployMigrate extends Command
{
    public function handle(): int
    {
        $exitCode = $this->call('migrate', ['--force' => true]);

        return $exitCode === self::SUCCESS ? self::SUCCESS : self::FAILURE;
    }
}
