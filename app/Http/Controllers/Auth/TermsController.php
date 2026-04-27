<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\TermsAcceptRequest;
use Illuminate\Http\RedirectResponse;

class TermsController extends Controller
{
    /**
     * Show the terms and conditions page.
     */
    public function show()
    {
        return inertia('auth/terms', [
            'intended' => request()->query('intended', route('dashboard')),
        ]);
    }

    /**
     * Accept the terms and conditions.
     */
    public function accept(TermsAcceptRequest $request): RedirectResponse
    {
        $user = $request->user();

        $user->update(['read_terms' => true]);

        $intended = $request->input('intended', route('dashboard'));

        return redirect()->to($intended);
    }
}
