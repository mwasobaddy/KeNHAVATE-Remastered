<?php

use App\Http\Controllers\Auth\OtpController;
use App\Http\Controllers\Auth\SocialiteController;
use App\Http\Controllers\Auth\TermsController;
use App\Http\Controllers\Auth\WorkEmailVerificationController;
use App\Http\Controllers\Onboarding\OnboardingController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

// Google OAuth routes
Route::get('auth/google/redirect', [SocialiteController::class, 'redirectToGoogle'])
    ->name('google.redirect');

Route::get('auth/google/callback', [SocialiteController::class, 'handleGoogleCallback'])
    ->name('google.callback');

// Signed URL for work email verification (no auth middleware — accessed from email link)
Route::get('work-email/verify/{id}', [WorkEmailVerificationController::class, 'verify'])
    ->name('work-email.verify')
    ->middleware('signed');

// OTP routes
Route::get('otp/verify', [OtpController::class, 'showVerifyForm'])
    ->name('otp.verify');
Route::post('otp/send', [OtpController::class, 'send'])
 ->middleware('throttle:6,1')
 ->name('otp.send');
Route::post('otp/verify', [OtpController::class, 'verify'])
 ->middleware('throttle:6,1')
 ->name('otp.verify.submit');
Route::post('otp/resend', [OtpController::class, 'resend'])
    ->name('otp.resend');

Route::middleware(['auth'])->group(function () {
    // Terms and conditions
    Route::get('terms', [TermsController::class, 'show'])->name('terms.show');
    Route::post('terms/accept', [TermsController::class, 'accept'])->name('terms.accept');

    // Onboarding routes
    Route::get('onboarding/start', [OnboardingController::class, 'start'])
        ->name('onboarding.start');
    Route::get('onboarding/step1', [OnboardingController::class, 'step1'])
        ->name('onboarding.step1');
    Route::post('onboarding/step1', [OnboardingController::class, 'updateStep1'])
        ->name('onboarding.step1.update');
    Route::get('onboarding/step2', [OnboardingController::class, 'step2'])
        ->name('onboarding.step2');
    Route::post('onboarding/step2', [OnboardingController::class, 'updateStep2'])
        ->name('onboarding.step2.update');
    Route::get('onboarding/step3', [OnboardingController::class, 'step3'])
        ->name('onboarding.step3');
    Route::post('onboarding/step3', [OnboardingController::class, 'updateStep3'])
        ->name('onboarding.step3.update');

    // Work email verification routes (auth required but NOT the verified middleware)
    Route::get('work-email/verify', [WorkEmailVerificationController::class, 'show'])
        ->name('work-email.verify.show');
    Route::post('work-email/verify/resend', [WorkEmailVerificationController::class, 'resend'])
        ->name('work-email.verify.resend');

    Route::middleware(['verified'])->group(function () {
        Route::inertia('dashboard', 'dashboard')->name('dashboard');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/idea.php';
