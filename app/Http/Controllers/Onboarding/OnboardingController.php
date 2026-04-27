<?php

namespace App\Http\Controllers\Onboarding;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Region;
use App\Models\User;
use App\Notifications\VerifyWorkEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

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
        $user = Auth::user();

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'other_names' => ['required', 'string', 'max:255'],
            'mobile_number' => ['required', 'string', 'max:20'],
            'gender' => ['required', 'string', 'in:male,female'],
            'avatar' => [$user->avatar ? 'nullable' : 'required', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
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
            // Check if step 1 fields are filled (in case session expired)
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
    public function updateStep2(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $hasPassword = ! empty($user->password);
        $passwordFilled = $request->filled('password');

        $rules = [
            'needs_staff_details' => ['nullable', 'boolean'],
        ];

        // Require password if user doesn't have one or if they're trying to set a new one
        if (! $hasPassword || $passwordFilled) {
            $rules['password'] = ['required', 'string', 'min:8', 'confirmed'];
        }

        $validated = $request->validate($rules);

        $updateData = [
            'is_staff' => $request->boolean('needs_staff_details'),
        ];

        if (! empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        $request->session()->put('onboarding.step2_completed', true);

        // If user wants staff details, go to step 3
        if ($request->boolean('needs_staff_details')) {
            return redirect()->route('onboarding.step3');
        }

        // Complete onboarding
        $user->update(['onboarding_completed' => true]);

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
            // Check if user is staff (should have been set in step 2)
            if (! $user->is_staff) {
                return redirect()->route('onboarding.step2');
            }
        }

        $regions = Region::where('is_active', true)
            ->with(['directorates' => function ($query) {
                $query->where('is_active', true)->with(['departments' => function ($query) {
                    $query->where('is_active', true);
                }]);
            }])
            ->get();

        // For @kenha.co.ke users, we already have their work email (used to login)
        // So we ask for their personal email instead
        $isKenhaEmail = ! empty($user->work_email) && str_ends_with($user->work_email, '@kenha.co.ke');

        // Get current user's region and directorate if they have a department
        $currentRegionId = null;
        $currentDirectorateId = null;
        if ($user->department_id) {
            $department = Department::find($user->department_id);
            if ($department && $department->directorate) {
                $currentDirectorateId = $department->directorate_id;
                if ($department->directorate->region) {
                    $currentRegionId = $department->directorate->region_id;
                }
            }
        }

        return inertia('auth/onboarding/Step3', [
            'regions' => $regions,
            'user' => [
                'work_email' => $user->work_email,
                'email' => $isKenhaEmail ? '' : $user->email,
                'region_id' => $currentRegionId,
                'directorate_id' => $currentDirectorateId,
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
                'region_id' => ['required', 'exists:regions,id'],
                'directorate_id' => ['required', 'exists:directorates,id'],
                'department_id' => ['required', 'exists:departments,id'],
                'employment_type' => ['required', 'string', 'in:attachment,internship,contract,permanent'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            ]);

            $user->update([
                'email' => $validated['email'],
                'department_id' => $validated['department_id'],
                'employment_type' => $validated['employment_type'],
                'is_staff' => true,
            ]);
        } else {
            // For non-Kenha users, they provided work email in step 3
            $validated = $request->validate([
                'region_id' => ['required', 'exists:regions,id'],
                'directorate_id' => ['required', 'exists:directorates,id'],
                'department_id' => ['required', 'exists:departments,id'],
                'employment_type' => ['required', 'string', 'in:attachment,internship,contract,permanent'],
                'work_email' => ['required', 'string', 'email', 'max:255', 'unique:users,work_email'],
            ]);

            $user->update([
                'work_email' => $validated['work_email'],
                'department_id' => $validated['department_id'],
                'employment_type' => $validated['employment_type'],
                'is_staff' => true,
            ]);
        }

        // Complete onboarding
        $user->update(['onboarding_completed' => true]);

        $request->session()->forget(['onboarding.step1_completed', 'onboarding.step2_completed']);

        // Send appropriate verification notification based on user type
        if ($isKenhaEmail) {
            // For Kenha users who just entered personal email, verify that email
            $user->sendEmailVerificationNotification();

            // Redirect to email verification notice page with status message
            return redirect()->route('verification.notice')->with('status', 'verification-link-sent');
        } else {
            // For non-Kenha users, verify their work email
            $user->notify(new VerifyWorkEmail);

            return redirect()->route('work-email.verify.show');
        }
    }
}
