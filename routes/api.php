<?php

use App\Http\Controllers\Api\Auth\EmailLoginController;
use App\Http\Controllers\Api\Auth\GoogleAuthController;
use App\Http\Controllers\Api\Auth\OnboardingController;
use App\Http\Controllers\Api\Auth\OtpVerificationController;
use App\Http\Controllers\Api\Auth\TermsController;
use Illuminate\Support\Facades\Route;

Route::get('auth/google', [GoogleAuthController::class, 'redirect']);
Route::get('auth/google/callback', [GoogleAuthController::class, 'callback']);
Route::post('auth/email', EmailLoginController::class);
Route::post('auth/otp/verify', [OtpVerificationController::class, 'store']);
Route::post('auth/otp/resend', [OtpVerificationController::class, 'resend']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('auth/logout', [OtpVerificationController::class, 'logout']);
    Route::get('user', [OtpVerificationController::class, 'user']);

    Route::get('onboarding', [OnboardingController::class, 'show']);
    Route::post('onboarding', [OnboardingController::class, 'store']);

    Route::get('auth/terms', [TermsController::class, 'show']);
    Route::post('auth/terms', [TermsController::class, 'store']);
});
