<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureDeployToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $expected = config('deploy.token');
        $provided = $request->header('X-Deploy-Token', $request->query('token'));

        if (blank($expected) || blank($provided) || ! hash_equals((string) $expected, (string) $provided)) {
            return response()->json([
                'message' => 'Invalid or missing deploy token.',
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
