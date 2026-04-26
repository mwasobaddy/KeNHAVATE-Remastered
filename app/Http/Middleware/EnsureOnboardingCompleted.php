<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureOnboardingCompleted
{
    /**
     * Routes that should be excluded from onboarding check.
     *
     * @var array<int, string>
     */
    protected $except = [
        'onboarding*',
        'logout*',
        'password*',
        'verification*',
    ];

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        // Skip check for guests and excluded routes
        if (! $user || $request->is($this->except)) {
            return $next($request);
        }

        // Check if user needs to complete onboarding
        if ($user->needsOnboarding()) {
            // Allow access to onboarding routes
            if ($request->is('onboarding*') || $request->routeIs('onboarding.*')) {
                return $next($request);
            }

            // Redirect to onboarding
            return redirect()->route('onboarding.start');
        }

        return $next($request);
    }
}
