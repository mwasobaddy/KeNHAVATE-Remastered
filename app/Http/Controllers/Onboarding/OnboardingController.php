<?php

namespace App\Http\Controllers\Onboarding;

use App\Http\Controllers\Controller;
use App\Http\Requests\Onboarding\Step1Request;
use App\Http\Requests\Onboarding\Step2Request;
use App\Http\Requests\Onboarding\Step3Request;
use App\Services\Onboarding\OnboardingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OnboardingController extends Controller
{
    public function __construct(
        private OnboardingService $onboardingService
    ) {}

    /**
     * Show the onboarding start page.
     */
    public function start()
    {
        return inertia('auth/onboarding/Start');
    }

    /**
     * Show step 1: Personal Information.
     */
    public function step1()
    {
        $user = Auth::user();

        return inertia('auth/onboarding/Step1', [
            'email' => $user->getLoginEmail(),
            'user' => [
                'first_name' => $user->first_name,
                'other_names' => $user->other_names,
                'mobile_number' => $user->mobile_number,
                'gender' => $user->gender,
                'avatar' => $user->avatar,
            ],
        ]);
    }

    /**
     * Handle step 1 form submission.
     */
    public function updateStep1(Step1Request $request): RedirectResponse
    {
        $user = Auth::user();
        $data = $request->validated();
        $avatarPath = null;

        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
        }

        $this->onboardingService->updateStep1($user, $data, $avatarPath);

        $request->session()->put('onboarding.step1_completed', true);

        return redirect()->route('onboarding.step2');
    }

    /**
     * Show step 2: Security Setup.
     */
    public function step2(Request $request)
    {
        $user = Auth::user();

        // Ensure step 1 is completed
        if (! $request->session()->has('onboarding.step1_completed')) {
            if (empty($user->first_name) || empty($user->other_names) || empty($user->mobile_number) || empty($user->gender)) {
                return redirect()->route('onboarding.step1');
            }
        }

        return inertia('auth/onboarding/Step2', [
            'email' => $user->getLoginEmail(),
        ]);
    }

    /**
     * Handle step 2 form submission.
     */
    public function updateStep2(Step2Request $request): RedirectResponse
    {
        $user = Auth::user();

        $this->onboardingService->updateStep2($user, $request->validated());

        $request->session()->put('onboarding.step2_completed', true);

        // If user wants staff details, go to step 3
        if ($request->boolean('needs_staff_details')) {
            return redirect()->route('onboarding.step3');
        }

        // Complete onboarding
        $this->onboardingService->completeOnboarding($user);

        $request->session()->forget(['onboarding.step1_completed', 'onboarding.step2_completed']);

        return redirect()->route('dashboard');
    }

    /**
     * Show step 3: Staff Details.
     */
    public function step3(Request $request)
    {
        $user = Auth::user();

        // Ensure step 2 is completed
        if (! $request->session()->has('onboarding.step2_completed')) {
            if (! $user->is_staff) {
                return redirect()->route('onboarding.step2');
            }
        }

        $step3Data = $this->onboardingService->getStep3Data($user);

        return inertia('auth/onboarding/Step3', [
            'regions' => $step3Data['regions'],
            'user' => [
                'work_email' => $user->work_email,
                'email' => $step3Data['isKenhaEmail'] ? '' : $user->email,
                'region_id' => $step3Data['currentRegionId'],
                'directorate_id' => $step3Data['currentDirectorateId'],
                'department_id' => $user->department_id,
                'employment_type' => $user->employment_type,
            ],
        ]);
    }

    /**
     * Handle step 3 form submission.
     */
    public function updateStep3(Step3Request $request): RedirectResponse
    {
        $user = Auth::user();
        $validated = $request->validated();

        $this->onboardingService->updateStep3($user, $validated);

        // Complete onboarding
        $this->onboardingService->completeOnboarding($user);

        $request->session()->forget(['onboarding.step1_completed', 'onboarding.step2_completed']);

        // Determine which email was just provided and send appropriate verification
        $verificationType = isset($validated['email']) ? 'email' : 'work_email';
        $redirectRoute = $this->onboardingService->sendVerificationNotification($user, $verificationType);

        if ($verificationType === 'email') {
            return redirect()->route($redirectRoute)->with('status', 'verification-link-sent');
        }

        return redirect()->route($redirectRoute);
    }
}
