<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\AuditService;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;

class TermsController extends Controller
{
    public function __construct(
        private AuditService $auditService,
    ) {}

    public function create(): RedirectResponse|Response
    {
        $user = auth()->user();

        if ($user->terms_accepted) {
            return redirect()->intended(route('dashboard'))
                ->with('success', 'Terms accepted. Welcome!');
        }

        return inertia('auth/terms', [
            'title' => config('terms.title'),
            'text' => config('terms.text'),
        ]);
    }

    public function store(): RedirectResponse
    {
        $user = auth()->user();
        $user->forceFill(['terms_accepted' => true])->save();

        $this->auditService->log($user, 'terms_accepted', 'Accepted terms and conditions');

        return redirect()->intended(route('dashboard'));
    }
}
