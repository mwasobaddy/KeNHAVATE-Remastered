<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOnboardingComplete
{
    public function handle(Request $request, Closure $next): Response
    {
        if (is_null($request->user()->onboarding_completed_at) && ! $request->routeIs('onboarding*')) {
            return redirect()->route('onboarding');
        }

        return $next($request);
    }
}
