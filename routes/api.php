<?php

use App\Http\Controllers\Api\Audit\AuditController as ApiAuditController;
use App\Http\Controllers\Api\Auth\EmailLoginController;
use App\Http\Controllers\Api\Auth\GoogleAuthController;
use App\Http\Controllers\Api\Auth\OnboardingController;
use App\Http\Controllers\Api\Auth\OtpVerificationController;
use App\Http\Controllers\Api\Auth\TermsController;
use App\Http\Controllers\Api\Ideas\AssignmentController as ApiAssignmentController;
use App\Http\Controllers\Api\Ideas\ChangeRequestController as ApiChangeRequestController;
use App\Http\Controllers\Api\Ideas\ClassificationController as ApiClassificationController;
use App\Http\Controllers\Api\Ideas\CollaborationController as ApiCollaborationController;
use App\Http\Controllers\Api\Ideas\Decisions\DecisionController as ApiDecisionController;
use App\Http\Controllers\Api\Ideas\Decisions\RevisionController as ApiRevisionController;
use App\Http\Controllers\Api\Ideas\IdeaController as ApiIdeaController;
use App\Http\Controllers\Api\Ideas\InvitationController as ApiInvitationController;
use App\Http\Controllers\Api\Ideas\ReviewController as ApiReviewController;
use App\Http\Controllers\Api\Points\LeaderboardController;
use App\Http\Controllers\Api\Points\PointController;
use App\Http\Controllers\Api\Points\TransactionController;
use App\Http\Controllers\Api\Roles\RoleController as ApiRoleController;
use App\Http\Controllers\Api\Users\UserController as ApiUserController;
use Illuminate\Support\Facades\Route;

Route::get('auth/google', [GoogleAuthController::class, 'redirect']);
Route::get('auth/google/callback', [GoogleAuthController::class, 'callback']);
Route::post('auth/email', EmailLoginController::class);
Route::post('auth/otp/verify', [OtpVerificationController::class, 'store']);
Route::post('auth/otp/resend', [OtpVerificationController::class, 'resend']);

Route::get('invitations/{token}', [ApiInvitationController::class, 'show']);

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

    Route::get('audit', [ApiAuditController::class, 'index']);

    Route::apiResource('roles', ApiRoleController::class)->only(['index', 'store', 'show', 'update', 'destroy'])->names('api.roles');
    Route::apiResource('users', ApiUserController::class)->only(['index', 'store', 'show', 'update', 'destroy'])->names('api.users');

    Route::post('invitations/{token}/accept', [ApiInvitationController::class, 'accept']);

    Route::prefix('ideas')->group(function () {
        Route::get('/', [ApiIdeaController::class, 'index']);
        Route::post('/', [ApiIdeaController::class, 'store']);
        Route::get('/review', [ApiReviewController::class, 'index']);
        Route::get('/{slug}', [ApiIdeaController::class, 'show']);
        Route::get('/{slug}/review', [ApiReviewController::class, 'show']);
        Route::put('/{slug}', [ApiIdeaController::class, 'update']);
        Route::delete('/{slug}', [ApiIdeaController::class, 'destroy']);

        Route::get('/{slug}/changes', [ApiChangeRequestController::class, 'index']);
        Route::post('/{slug}/changes', [ApiChangeRequestController::class, 'store']);
        Route::get('/{slug}/changes/{changeRequest}', [ApiChangeRequestController::class, 'show']);
        Route::post('/{slug}/changes/{changeRequest}/approve', [ApiChangeRequestController::class, 'approve']);
        Route::post('/{slug}/changes/{changeRequest}/reject', [ApiChangeRequestController::class, 'reject']);
        Route::delete('/{slug}/changes/{changeRequest}', [ApiChangeRequestController::class, 'destroy']);
        Route::post('/{slug}/changes/{changeRequest}/hide', [ApiChangeRequestController::class, 'hide']);
        Route::post('/{slug}/changes/{changeRequest}/unhide', [ApiChangeRequestController::class, 'unhide']);

        Route::get('/{slug}/collaborations', [ApiCollaborationController::class, 'index']);
        Route::post('/{slug}/collaborations', [ApiCollaborationController::class, 'store']);
        Route::post('/{slug}/collaborations/{collaboration}/approve', [ApiCollaborationController::class, 'approve']);
        Route::post('/{slug}/collaborations/{collaboration}/reject', [ApiCollaborationController::class, 'reject']);

        Route::post('/{slug}/assign', [ApiAssignmentController::class, 'store']);
        Route::post('/{slug}/classify', [ApiClassificationController::class, 'store']);
        Route::post('/{slug}/decide', [ApiDecisionController::class, 'store']);
        Route::post('/{slug}/progress', [ApiDecisionController::class, 'progress']);
        Route::post('/{slug}/request-revision', [ApiRevisionController::class, 'requestRevision']);
        Route::post('/{slug}/resubmit', [ApiRevisionController::class, 'resubmit']);
    });
});
