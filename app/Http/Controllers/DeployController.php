<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Artisan;

class DeployController extends Controller
{
    protected function execute(string $command, array $parameters = []): JsonResponse
    {
        $exitCode = Artisan::call($command, $parameters);

        return response()->json([
            'success' => $exitCode === 0,
            'exit_code' => $exitCode,
            'output' => Artisan::output(),
        ]);
    }

    public function clear(): JsonResponse
    {
        return $this->execute('deploy:clear');
    }

    public function build(): JsonResponse
    {
        return $this->execute('deploy:build');
    }

    public function migrate(): JsonResponse
    {
        return $this->execute('deploy:migrate');
    }

    public function migrateFresh(): JsonResponse
    {
        return $this->execute('deploy:migrate-fresh');
    }

    public function mailtest(): JsonResponse
    {
        return $this->execute('deploy:mailtest');
    }
}
