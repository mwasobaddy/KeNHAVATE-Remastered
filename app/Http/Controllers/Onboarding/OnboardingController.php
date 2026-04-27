<?php

namespace App\Http\Controllers\Onboarding;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\User;
use App\Notifications\VerifyWorkEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class OnboardingController extends Controller
{
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
    public function updateStep1(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'other_names' => ['required', 'string', 'max:255'],
            'mobile_number' => ['required', 'string', 'max:20'],
            'gender' => ['required', 'string', 'in:male,female'],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
        ]);

        $user = Auth::user();
        $data = collect($validated)->except('avatar')->toArray();

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update($data);

        return redirect()->route('onboarding.step2');
    }

    /**
     * Show step 2: Security Setup.
     */
    public function step2()
    {
        $user = Auth::user();

        return inertia('auth/onboarding/Step2', [
            'email' => $user->getLoginEmail(),
            'hasPassword' => ! is_null($user->password),
        ]);
    }

    /**
     * Handle step 2 form submission.
     */
    public function updateStep2(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $rules = [
            'password' => [Rule::requiredIf(! $user->password), 'string', 'min:8', 'confirmed'],
            'needs_staff_details' => ['nullable', 'boolean'],
        ];

        // If user already has a password, make it optional
        if ($user->password) {
            $rules['password'] = ['nullable', 'string', 'min:8', 'confirmed'];
        }

        $validated = $request->validate($rules);

        $user->update([
            'password' => $validated['password']
                ? Hash::make($validated['password'])
                : $user->password,
            'is_staff' => $request->boolean('needs_staff_details'),
        ]);

        // If user wants staff details, go to step 3
        if ($request->boolean('needs_staff_details')) {
            return redirect()->route('onboarding.step3');
        }

        // Complete onboarding
        $user->update(['onboarding_completed' => true]);

        return redirect()->route('dashboard');
    }

    /**
     * Show step 3: Staff Details.
     */
    public function step3()
    {
        $user = Auth::user();
        $departments = Department::where('is_active', true)
            ->with('directorate.region')
            ->get();

        // For @kenha.co.ke users, we already have their work email (used to login)
        // So we ask for their personal email instead
        $isKenhaEmail = ! empty($user->work_email) && str_ends_with($user->work_email, '@kenha.co.ke');

        return inertia('auth/onboarding/Step3', [
            'departments' => $departments,
            'user' => [
                'work_email' => $user->work_email,
                'email' => $isKenhaEmail ? '' : $user->email, // For Kenha users, ask for personal email
                'department_id' => $user->department_id,
                'employment_type' => $user->employment_type,
            ],
        ]);
    }

    /**
     * Handle step 3 form submission.
     */
    public function updateStep3(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $isKenhaEmail = ! empty($user->work_email) && str_ends_with($user->work_email, '@kenha.co.ke');

        if ($isKenhaEmail) {
            // For Kenha users, they provided personal email in step 3
            $validated = $request->validate([
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
                'department_id' => ['required', 'exists:departments,id'],
                'employment_type' => ['required', 'string', 'in:attachment,internship,contract,permanent'],
            ]);

            $user->update(array_merge($validated, ['is_staff' => true]));
        } else {
            // For non-Kenha users, they provided work email in step 3
            $validated = $request->validate([
                'work_email' => ['required', 'string', 'email', 'max:255', 'unique:users,work_email'],
                'department_id' => ['required', 'exists:departments,id'],
                'employment_type' => ['required', 'string', 'in:attachment,internship,contract,permanent'],
            ]);

            $user->update(array_merge($validated, ['is_staff' => true]));
        }

        // Complete onboarding
        $user->update(['onboarding_completed' => true]);

        // Send appropriate verification notification based on user type
        $isKenhaEmail = ! empty($user->work_email) && str_ends_with($user->work_email, '@kenha.co.ke');
        if ($isKenhaEmail) {
            // For Kenha users who just entered personal email, verify that email
            $user->sendEmailVerificationNotification();

            // Redirect to email verification notice page
            return redirect()->route('verification.notice');
        } else {
            // For non-Kenha users, verify their work email
            $user->notify(new VerifyWorkEmail);

            return redirect()->route('work-email.verify.show');
        }
    }
}
