<?php

namespace App\Services\Support;

use Closure;
use Illuminate\Support\Facades\Log;

trait SendsMailSafely
{
    protected function sendMailSafely(string $context, Closure $send): bool
    {
        try {
            $send();

            return true;
        } catch (\Throwable $e) {
            Log::error('Mail failed to send', [
                'context' => $context,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }
}
