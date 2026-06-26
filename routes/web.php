<?php

use App\Http\Controllers\Auth\EmailLoginController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\OnboardingController;
use App\Http\Controllers\Auth\OtpVerificationController;
use App\Http\Controllers\Auth\TermsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware('guest')->group(function () {
    Route::get('auth/google', [GoogleAuthController::class, 'redirect'])->name('auth.google');
    Route::get('auth/google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');
    Route::post('auth/email', EmailLoginController::class)->name('auth.email');
    Route::get('auth/otp', [OtpVerificationController::class, 'create'])->name('auth.otp');
    Route::post('auth/otp/verify', [OtpVerificationController::class, 'store'])->name('auth.otp.verify');
    Route::post('auth/otp/resend', [OtpVerificationController::class, 'resend'])->name('auth.otp.resend');
});

Route::middleware('auth')->group(function () {
    Route::get('onboarding', [OnboardingController::class, 'create'])->name('onboarding');
    Route::post('onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');
});

Route::middleware('auth')->group(function () {
    Route::get('auth/terms', [TermsController::class, 'create'])->name('terms');
    Route::post('auth/terms', [TermsController::class, 'store'])->name('terms.store');
});

Route::middleware(['auth', 'verified', 'onboarding.complete', 'terms'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::inertia('settings/profile', 'settings/profile')->name('profile.edit');
    Route::inertia('settings/security', 'settings/security')->name('security.edit');
    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');

    Route::delete('settings/profile', function (Request $request) {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        auth()->logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    })->name('profile.destroy');
});
