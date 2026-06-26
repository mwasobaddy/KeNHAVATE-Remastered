<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTermsAccepted
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()->terms_accepted && ! $request->routeIs('terms*')) {
            return redirect()->route('terms');
        }

        return $next($request);
    }
}
