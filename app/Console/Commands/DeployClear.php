<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('deploy:clear')]
#[Description('Clear all Laravel application caches (config, route, view, event, compiled, cache)')]
class DeployClear extends Command
{
    public function handle(): int
    {
        $exitCode = $this->call('optimize:clear');

        return $exitCode === self::SUCCESS ? self::SUCCESS : self::FAILURE;
    }
}
