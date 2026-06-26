<?php

use App\Http\Controllers\Api\Auth\EmailLoginController;
use App\Http\Controllers\Api\Auth\GoogleAuthController;
use App\Http\Controllers\Api\Auth\OnboardingController;
use App\Http\Controllers\Api\Auth\OtpVerificationController;
use App\Http\Controllers\Api\Auth\TermsController;
use App\Http\Controllers\Api\Points\LeaderboardController;
use App\Http\Controllers\Api\Points\PointController;
use App\Http\Controllers\Api\Points\TransactionController;
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

    Route::prefix('points')->group(function () {
        Route::get('/', [PointController::class, 'index']);
        Route::post('/', [PointController::class, 'store']);
        Route::get('/{point}', [PointController::class, 'show']);
        Route::put('/{point}', [PointController::class, 'update']);
        Route::delete('/{point}', [PointController::class, 'destroy']);
        Route::patch('/{point}/toggle', [PointController::class, 'toggle']);
        Route::get('/transactions', [TransactionController::class, 'index']);
    });

    Route::get('leaderboard', [LeaderboardController::class, 'index']);
});
