<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Services\AuthService;
use App\Services\OtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Response;

class OtpVerificationController extends Controller
{
    public function __construct(
        private AuthService $authService,
        private OtpService $otpService,
    ) {}

    public function create(): RedirectResponse|Response
    {
        if (! session()->has('otp_email')) {
            return redirect()->route('login');
        }

        return inertia('auth/otp', [
            'email' => session('otp_email'),
            'cooldown_remaining' => $this->otpService->getRemainingCooldown(session('otp_email')),
        ]);
    }

    public function store(VerifyOtpRequest $request): RedirectResponse
    {
        $email = session('otp_email');

        if (! $email) {
            return redirect()->route('login');
        }

        try {
            $user = $this->authService->verifyOtpLogin($email, $request->input('otp'));
        } catch (\RuntimeException) {
            throw ValidationException::withMessages([
                'otp' => 'Invalid or expired OTP. Please try again.',
            ]);
        }

        auth()->login($user, $request->boolean('remember'));
        session()->forget('otp_email');

        if ($user->onboarding_completed_at) {
            return redirect()->intended(route('dashboard'));
        }

        return redirect()->route('onboarding');
    }

    public function resend(Request $request): RedirectResponse
    {
        $email = session('otp_email');

        if (! $email) {
            return redirect()->route('login');
        }

        if ($this->otpService->isCooldownActive($email)) {
            return back()->withErrors([
                'email' => 'Please wait before requesting another OTP.',
            ]);
        }

        $this->authService->resendOtp($email);
        $this->otpService->markCooldown($email);

        return back()->with('status', 'A new OTP has been sent to your email.');
    }
}
