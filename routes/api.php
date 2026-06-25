<?php

use App\Http\Controllers\Api\Auth\EmailLoginController;
use App\Http\Controllers\Api\Auth\OnboardingController;
use App\Http\Controllers\Api\Auth\OtpVerificationController;
use Illuminate\Support\Facades\Route;

Route::post('auth/email', EmailLoginController::class);
Route::post('auth/otp/verify', [OtpVerificationController::class, 'store']);
Route::post('auth/otp/resend', [OtpVerificationController::class, 'resend']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('auth/logout', [OtpVerificationController::class, 'logout']);
    Route::get('user', [OtpVerificationController::class, 'user']);

    Route::get('onboarding', [OnboardingController::class, 'show']);
    Route::post('onboarding', [OnboardingController::class, 'store']);
});
