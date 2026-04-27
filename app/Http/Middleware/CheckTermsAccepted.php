<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class CheckTermsAccepted
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): mixed
    {
        $user = Auth::user();

        // Allow access to auth routes (terms page, login, etc.)
        if ($request->is('terms*', 'login', 'logout', 'register', 'otp/*', 'email/*', 'work-email/*', 'onboarding/*', 'password/*')) {
            return $next($request);
        }

        // Check if user has accepted terms
        if ($user && ! $user->read_terms) {
            $intended = $request->fullUrl();

            return redirect()->route('terms.show', ['intended' => $intended]);
        }

        return $next($request);
    }
}
