<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\OnboardingRequest;
use App\Services\OnboardingService;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function __construct(
        private OnboardingService $onboardingService,
    ) {}

    public function create(): RedirectResponse|Response
    {
        $user = auth()->user();

        if ($user->onboarding_completed_at) {
            return redirect()->intended(route('dashboard'));
        }

        return inertia('auth/onboarding', $this->onboardingService->getFormData($user));
    }

    public function store(OnboardingRequest $request): RedirectResponse
    {
        $redirectUrl = $this->onboardingService->complete(
            $request->user(),
            $request->validated(),
        );

        return redirect()->intended($redirectUrl ?? route('dashboard'));
    }
}
