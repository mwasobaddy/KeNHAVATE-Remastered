<?php

use App\Http\Middleware\EnsureDeployToken;
use App\Http\Middleware\EnsureOnboardingComplete;
use App\Http\Middleware\EnsureTermsAccepted;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->validateCsrfTokens(except: ['build', 'clear', 'migrate', 'migrate-fresh']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'deploy.token' => EnsureDeployToken::class,
            'onboarding.complete' => EnsureOnboardingComplete::class,
            'terms' => EnsureTermsAccepted::class,
            'permission' => PermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function (Response $response, Throwable $exception, Request $request) {
            if (! in_array($response->getStatusCode(), [403, 419])) {
                return $response;
            }

            $message = $response->getStatusCode() === 403
                ? 'You do not have permission to perform this action.'
                : 'Session expired. Please log in again.';

            // Inertia XHR: flash the error directly to the session and return a
            // 409 with X-Inertia-Redirect. Inertia's client natively handles
            // this by calling router.visit(), which preserves all X-Inertia
            // headers — unlike a bare 302 where the browser's XHR redirect
            // follow can behave inconsistently across calls.
            if ($request->header('X-Inertia')) {
                $request->session()->flash('error', $message);

                $url = $request->isMethod('GET')
                    ? $request->header('Referer', route('dashboard'))
                    : url()->previous();

                return response('', 409, ['X-Inertia-Redirect' => $url]);
            }

            // API/JSON: let the caller handle the raw 403/419 response.
            if ($request->expectsJson()) {
                return $response;
            }

            // Direct browser visit: redirect to dashboard with flash.
            return redirect(route('dashboard'))->with('error', $message);
        });
    })->create();
