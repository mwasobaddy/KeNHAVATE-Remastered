<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\SendOtpRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Services\Auth\OtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OtpController extends Controller
{
    public function __construct(
        private OtpService $otpService
    ) {}

    /**
     * Show the OTP verification page.
     */
    public function showVerifyForm(Request $request): RedirectResponse|Response
    {
        $email = $request->session()->get('otp_email');

        if (! $email) {
            return redirect()->route('login');
        }

        // Check if user is a Google OAuth user — skip OTP, log them in directly
        $user = $this->otpService->checkGoogleOAuth($email);

        if ($user) {
            Auth::login($user, true);

            return redirect()->intended(route('dashboard'));
        }

        return Inertia::render('auth/verify-otp', [
            'email' => $email,
        ]);
    }

    /**
     * Find or create a user by email, then send an OTP.
     */
    public function send(SendOtpRequest $request): RedirectResponse
    {
        $email = $request->input('email');

        $this->otpService->sendOtp($email);

        // Store email in session for the verify step
        $request->session()->put('otp_email', $email);

        return redirect()->route('otp.verify');
    }

    /**
     * Verify the OTP and log the user in.
     */
    public function verify(VerifyOtpRequest $request): RedirectResponse
    {
        $email = $request->session()->get('otp_email');

        if (! $email) {
            return redirect()->route('login')->withErrors([
                'email' => 'Session expired. Please start over.',
            ]);
        }

        $user = $this->otpService->verifyOtp($email, $request->input('otp'));

        if (! $user) {
            return back()->withErrors([
                'otp' => 'Invalid or expired verification code.',
            ]);
        }

        Auth::login($user, $request->boolean('remember'));

        // Clear session
        $request->session()->forget('otp_email');

        return redirect()->intended(route('dashboard'));
    }

    /**
     * Resend a new OTP (rate-limited on frontend to 60s).
     * Only generates a new code if the existing one has expired or been used.
     */
    public function resend(Request $request): RedirectResponse
    {
        $email = $request->session()->get('otp_email');

        if (! $email) {
            return redirect()->route('login')->withErrors([
                'email' => 'Session expired. Please start over.',
            ]);
        }

        $this->otpService->resendOtp($email);

        return back()->with('status', 'A new verification code has been sent to your email.');
    }
}
