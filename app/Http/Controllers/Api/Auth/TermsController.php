<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class TermsController extends Controller
{
    public function show(): JsonResponse
    {
        $user = auth()->user();

        return response()->json([
            'accepted' => (bool) $user->terms_accepted,
            'title' => config('terms.title'),
            'text' => config('terms.text'),
        ]);
    }

    public function store(): JsonResponse
    {
        auth()->user()->forceFill(['terms_accepted' => true])->save();

        return response()->json([
            'message' => 'Terms and conditions accepted.',
        ]);
    }
}
