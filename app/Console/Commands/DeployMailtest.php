<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Mail;

#[Signature('deploy:mailtest')]
#[Description('Probe mail connectivity and attempt an end-to-end send')]
class DeployMailtest extends Command
{
    private const PROBE_TIMEOUT = 8;

    public function handle(): int
    {
        $host = (string) (config('mail.mailers.smtp.host') ?: 'smtp.gmail.com');
        $port = (int) (config('mail.mailers.smtp.port') ?: 587);

        $this->components->twoColumnDetail('Mailer', (string) config('mail.default'));
        $this->components->twoColumnDetail('Configured host', "{$host}:{$port}");
        $this->components->twoColumnDetail('Configured username', (string) config('mail.mailers.smtp.username'));
        $this->components->twoColumnDetail('Configured from', (string) config('mail.from.address'));

        if ((string) config('mail.default') === 'resend') {
            $this->components->info('End-to-end send test (via Resend HTTP API):');
            $this->line('api.resend.com        : '.$this->resendSendTest());

            return self::SUCCESS;
        }

        $this->components->info('Connectivity checks (8s timeout per probe):');

        $this->line('Configured SMTP endpoint : '.$this->probe($host, $port));

        if ($host !== 'smtp.gmail.com') {
            $this->line('smtp.gmail.com:587      : '.$this->probe('smtp.gmail.com', 587));
            $this->line('smtp.gmail.com:465      : '.$this->probe('smtp.gmail.com', 465));
        }

        return self::SUCCESS;
    }

    protected function resendSendTest(): string
    {
        try {
            Mail::raw('Railway mail transport test', function (Message $message) {
                $message->to(config('mail.from.address'));
            });

            return '<fg=green>OK</> (message accepted by Resend)';
        } catch (\Throwable $e) {
            return '<fg=red>FAIL</> ('.$e->getMessage().')';
        }
    }

    protected function probe(string $host, int $port, bool $tls = false): string
    {
        $ip = gethostbyname($host);
        $errno = null;
        $errstr = null;

        $context = null;

        if ($tls) {
            $context = stream_context_create([
                'ssl' => [
                    'crypto_method' => STREAM_CRYPTO_METHOD_TLS_CLIENT | STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT,
                ],
            ]);
        }

        $stream = @stream_socket_client(
            "{$host}:{$port}",
            $errno,
            $errstr,
            self::PROBE_TIMEOUT,
            STREAM_CLIENT_CONNECT,
            $context,
        );

        if (! is_resource($stream)) {
            return "<fg=red>FAIL</> (ip: {$ip}, errno: {$errno}, errstr: {$errstr})";
        }

        stream_set_timeout($stream, 2);
        $banner = trim((string) fgets($stream));
        fclose($stream);

        return "<fg=green>OK</> (ip: {$ip}, banner: {$banner})";
    }
}
