<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailsVerified
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): mixed
    {
        $user = Auth::user();

        if (! $user) {
            return $next($request);
        }

        // Skip for work email verification routes to avoid redirect loops
        if ($request->routeIs('work-email.*')) {
            return $next($request);
        }

        // Skip for auth, onboarding, and utility routes
        if ($request->routeIs('login*', 'logout*', 'otp*', 'onboarding*', 'password*', 'verification*', 'email*', 'auth.*')) {
            return $next($request);
        }

        // Only apply the work email check if the user has a work email set
        if ($user->work_email && ! $user->hasVerifiedWorkEmail()) {
            return redirect()->route('work-email.verify.show');
        }

        // Ensure primary email is verified (Fortify's built-in check)
        if (! $user->hasVerifiedEmail()) {
            return redirect()->route('verification.notice');
        }

        return $next($request);
    }
}
