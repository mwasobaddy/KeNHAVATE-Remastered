<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\VerifyWorkEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class WorkEmailVerificationController extends Controller
{
    /**
     * Show the verify work email page.
     */
    public function show(): Response|RedirectResponse
    {
        $user = Auth::user();

        if (! $user || ! $user->work_email) {
            return redirect()->route('dashboard');
        }

        if ($user->hasVerifiedWorkEmail()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('auth/verify-work-email', [
            'workEmail' => $user->work_email,
            'status' => session('status'),
        ]);
    }

    /**
     * Verify the work email using a signed URL.
     */
    public function verify(Request $request, string $id): RedirectResponse
    {
        $user = User::findOrFail($id);

        if ($user->hasVerifiedWorkEmail()) {
            return redirect()->route('dashboard');
        }

        $user->update(['work_email_verified_at' => now()]);

        // Log the user in so they can access the dashboard
        Auth::login($user);

        return redirect()->route('dashboard')->with('status', 'Work email verified successfully.');
    }

    /**
     * Resend the work email verification notification.
     */
    public function resend(Request $request): RedirectResponse
    {
        $user = Auth::user();

        if (! $user || ! $user->work_email) {
            return redirect()->route('dashboard');
        }

        if ($user->hasVerifiedWorkEmail()) {
            return redirect()->route('dashboard');
        }

        $user->notify(new VerifyWorkEmail);

        return back()->with('status', 'A new verification link has been sent to your work email.');
    }
}
