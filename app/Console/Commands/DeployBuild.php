<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;

#[Signature('deploy:build')]
#[Description('Install frontend dependencies and build static assets (pnpm install && pnpm run build)')]
class DeployBuild extends Command
{
    public function handle(): int
    {
        $this->components->info('Building frontend assets...');

        $result = Process::timeout(900)
            ->path(base_path())
            ->run('pnpm install --frozen-lockfile && pnpm run build');

        if ($output = trim($result->output())) {
            $this->line($output);
        }

        if ($error = trim($result->errorOutput())) {
            $this->line($error);
        }

        if ($result->successful()) {
            $this->components->success('Frontend assets built successfully.');

            return self::SUCCESS;
        }

        $this->components->error('Frontend build failed.');

        return self::FAILURE;
    }
}
