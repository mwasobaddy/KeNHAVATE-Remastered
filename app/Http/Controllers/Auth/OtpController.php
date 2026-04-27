<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\SendOtpMail;
use App\Models\Otp;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OtpController extends Controller
{
    /**
     * Generate a 6-digit OTP.
     */
    private function generateOtp(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

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
        $user = User::where(function($query) use ($email) {
            $query->where('email', $email)
                  ->orWhere('work_email', $email);
        })->first();
        if ($user && $user->usesGoogleOAuth()) {
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
    public function send(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
        ]);

        $email = $request->input('email');

        // Determine if this is a Kenha email that should go to work_email
        $isKenhaEmail = Str::endsWith($email, '@kenha.co.ke');
         
        // Find or create the user
        // For Kenha emails, search by either email or work_email, then set both fields
        // For regular emails, search and set only email field
        if ($isKenhaEmail) {
            $user = User::firstOrCreate(
                // Search for existing user by either email or work_email
                [
                    'email' => $email,
                    'work_email' => $email,
                ],
                [
                    'first_name' => explode('@', $email)[0],
                    'email' => $email,
                    'work_email' => $email,
                    'password' => Hash::make(Str::random(24)),
                    'email_verified_at' => null,
                    'work_email_verified_at' => now(),
                    'onboarding_completed' => false,
                ]
            );
        } else {
            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'first_name' => explode('@', $email)[0],
                    'email' => $email,
                    'password' => Hash::make(Str::random(24)),
                    'email_verified_at' => now(),
                    'onboarding_completed' => false,
                ]
            );
        }

        if ($user->wasRecentlyCreated) {
            $user->assignRole('user');
        }

        // Invalidate any previous unused OTPs for this user
        Otp::where('user_id', $user->id)
            ->where('type', 'login')
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->update(['used_at' => now()]);

        // Generate and save new OTP
        $otpCode = $this->generateOtp();
        Otp::create([
            'user_id' => $user->id,
            'otp' => $otpCode,
            'type' => 'login',
            'expires_at' => now()->addMinutes(30),
        ]);

        // Send OTP via email
        Mail::to($email)->send(new SendOtpMail($otpCode, 'login'));

        // Store email in session for the verify step
        $request->session()->put('otp_email', $email);

        return redirect()->route('otp.verify');
    }

    /**
     * Verify the OTP and log the user in.
     */
    public function verify(Request $request): RedirectResponse
    {
        $email = $request->session()->get('otp_email');

        if (! $email) {
            return redirect()->route('login')->withErrors([
                'email' => 'Session expired. Please start over.',
            ]);
        }

        $request->validate([
            'otp' => ['required', 'string', 'size:6'],
        ]);

        $otpCode = $request->input('otp');

        // Find the user - check both email and work_email fields
        $user = User::where(function($query) use ($email) {
            $query->where('email', $email)
                  ->orWhere('work_email', $email);
        })->first();

        if (! $user) {
            return redirect()->route('login')->withErrors([
                'email' => 'Session expired. Please start over.',
            ]);
        }

        // Find a valid, unused OTP for this user
        $otp = Otp::where('user_id', $user->id)
            ->where('otp', $otpCode)
            ->where('type', 'login')
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (! $otp) {
            return back()->withErrors([
                'otp' => 'Invalid or expired verification code.',
            ]);
        }

        // Mark OTP as used
        $otp->markAsUsed();

        // Mark the appropriate email field as verified
        $isKenhaEmail = Str::endsWith($email, '@kenha.co.ke');
        if ($isKenhaEmail) {
            // Mark work email as verified
            if (! $user->hasVerifiedWorkEmail()) {
                $user->markWorkEmailAsVerified();
            }
        } else {
            // Mark regular email as verified
            if (! $user->hasVerifiedEmail()) {
                $user->markEmailAsVerified();
            }
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

         $user = User::where(function($query) use ($email) {
             $query->where('email', $email)
                   ->orWhere('work_email', $email);
         })->first();

        if (! $user) {
            return redirect()->route('login')->withErrors([
                'email' => 'Session expired. Please start over.',
            ]);
        }

        // Check if there's a still-valid, unused OTP
        $existingOtp = Otp::where('user_id', $user->id)
            ->where('type', 'login')
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if ($existingOtp) {
            // Resend the same code — it's still valid
            Mail::to($email)->send(new SendOtpMail($existingOtp->otp, 'login'));

            return back()->with('status', 'A new verification code has been sent to your email.');
        }

        // Existing code is expired or used — generate a new one
        $otpCode = $this->generateOtp();
        Otp::create([
            'user_id' => $user->id,
            'otp' => $otpCode,
            'type' => 'login',
            'expires_at' => now()->addMinutes(30),
        ]);

        Mail::to($email)->send(new SendOtpMail($otpCode, 'login'));

        return back()->with('status', 'A new verification code has been sent to your email.');
    }
}
