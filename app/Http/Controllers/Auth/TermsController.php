<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;

class TermsController extends Controller
{
    public function create(): RedirectResponse|Response
    {
        $user = auth()->user();

        if ($user->terms_accepted) {
            return redirect()->intended(route('dashboard'));
        }

        return inertia('auth/terms', [
            'title' => config('terms.title'),
            'text' => config('terms.text'),
        ]);
    }

    public function store(): RedirectResponse
    {
        auth()->user()->forceFill(['terms_accepted' => true])->save();

        return redirect()->intended(route('dashboard'));
    }
}
