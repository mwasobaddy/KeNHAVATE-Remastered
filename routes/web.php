<?php

use App\Http\Controllers\Audit\AuditController;
use App\Http\Controllers\Auth\EmailLoginController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\OnboardingController;
use App\Http\Controllers\Auth\OtpVerificationController;
use App\Http\Controllers\Auth\TermsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Ideas\AssignmentController;
use App\Http\Controllers\Ideas\ChangeRequestController;
use App\Http\Controllers\Ideas\ClassificationController;
use App\Http\Controllers\Ideas\CollaborationController;
use App\Http\Controllers\Ideas\CollaborationRequestController;
use App\Http\Controllers\Ideas\Decisions\DecisionController;
use App\Http\Controllers\Ideas\Decisions\RevisionController;
use App\Http\Controllers\Ideas\IdeaController;
use App\Http\Controllers\Ideas\InvitationController;
use App\Http\Controllers\Ideas\ReviewController;
use App\Http\Controllers\Points\LeaderboardController;
use App\Http\Controllers\Points\PointController;
use App\Http\Controllers\Points\TransactionController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\Roles\RoleController;
use App\Http\Controllers\Users\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', [PublicController::class, 'home'])->name('home');
Route::get('how-it-works', fn () => inertia('public/how-it-works'))->name('how-it-works');
Route::get('about', fn () => inertia('public/about'))->name('about');
Route::get('contact', [PublicController::class, 'contact'])->name('contact');
Route::post('contact', [PublicController::class, 'contact']);
Route::get('explore', [PublicController::class, 'explore'])->name('explore');
Route::get('explore/{slug}', [PublicController::class, 'show'])->name('explore.show');

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

Route::get('invitations/{token}', [InvitationController::class, 'show'])->name('invitations.show');
Route::post('invitations/accept', [InvitationController::class, 'acceptFromLogin'])->name('invitations.accept');

Route::middleware(['auth', 'verified', 'onboarding.complete', 'terms'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
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

    Route::prefix('points')->name('points.')->group(function () {
        Route::get('/', [PointController::class, 'index'])
            ->name('index')
            ->middleware('permission:points.view|points.create|points.edit|points.delete');

        Route::get('/create', [PointController::class, 'create'])
            ->name('create')
            ->middleware('permission:points.create');

        Route::post('/', [PointController::class, 'store'])
            ->name('store')
            ->middleware('permission:points.create');

        Route::get('/{point}/edit', [PointController::class, 'edit'])
            ->name('edit')
            ->middleware('permission:points.edit');

        Route::put('/{point}', [PointController::class, 'update'])
            ->name('update')
            ->middleware('permission:points.edit');

        Route::delete('/{point}', [PointController::class, 'destroy'])
            ->name('destroy')
            ->middleware('permission:points.delete');

        Route::patch('/{point}/toggle', [PointController::class, 'toggle'])
            ->name('toggle')
            ->middleware('permission:points.edit');

        Route::get('/transactions', [TransactionController::class, 'index'])
            ->name('transactions')
            ->middleware('permission:points.view');
    });

    Route::get('leaderboard', [LeaderboardController::class, 'index'])->name('leaderboard');

    Route::get('audit', [AuditController::class, 'index'])
        ->name('audit.index')
        ->middleware('permission:audit.view');

    Route::prefix('roles')->name('roles.')->group(function () {
        Route::get('/', [RoleController::class, 'index'])
            ->name('index')
            ->middleware('permission:role.manage|role.create|role.edit|role.delete');

        Route::get('/create', [RoleController::class, 'create'])
            ->name('create')
            ->middleware('permission:role.create');

        Route::post('/', [RoleController::class, 'store'])
            ->name('store')
            ->middleware('permission:role.create');

        Route::get('/{role}/edit', [RoleController::class, 'edit'])
            ->name('edit')
            ->middleware('permission:role.edit');

        Route::put('/{role}', [RoleController::class, 'update'])
            ->name('update')
            ->middleware('permission:role.edit');

        Route::delete('/{role}', [RoleController::class, 'destroy'])
            ->name('destroy')
            ->middleware('permission:role.delete');
    });

    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [UserController::class, 'index'])
            ->name('index')
            ->middleware('permission:user.manage|user.create|user.edit|user.delete');

        Route::get('/create', [UserController::class, 'create'])
            ->name('create')
            ->middleware('permission:user.create');

        Route::post('/', [UserController::class, 'store'])
            ->name('store')
            ->middleware('permission:user.create');

        Route::get('/{user}/edit', [UserController::class, 'edit'])
            ->name('edit')
            ->middleware('permission:user.edit');

        Route::put('/{user}', [UserController::class, 'update'])
            ->name('update')
            ->middleware('permission:user.edit');

        Route::delete('/{user}', [UserController::class, 'destroy'])
            ->name('destroy')
            ->middleware('permission:user.delete');
    });

    Route::prefix('ideas')->name('ideas.')->group(function () {
        Route::get('/', [IdeaController::class, 'index'])->name('index');
        Route::get('/review', [ReviewController::class, 'index'])->name('review');
        Route::get('/create', [IdeaController::class, 'create'])->name('create');
        Route::post('/', [IdeaController::class, 'store'])->name('store');

        Route::get('/collaborations/request-inbox', [CollaborationRequestController::class, 'inbox'])->name('collaborations.inbox');
        Route::get('/collaborations/request-outbox', [CollaborationRequestController::class, 'outbox'])->name('collaborations.outbox');

        Route::get('/changes/request-outbox', [ChangeRequestController::class, 'mine'])->name('changes.mine');
        Route::get('/changes/request-inbox', [ChangeRequestController::class, 'pending'])->name('changes.pending');

        Route::get('/{slug}', [IdeaController::class, 'show'])->name('show');
        Route::get('/{slug}/review', [ReviewController::class, 'show'])->name('review-show');
        Route::get('/{slug}/edit', [IdeaController::class, 'edit'])->name('edit');
        Route::put('/{slug}', [IdeaController::class, 'update'])->name('update');
        Route::delete('/{slug}', [IdeaController::class, 'destroy'])->name('destroy');
        Route::get('/{slug}/documents/{document}', [IdeaController::class, 'downloadDocument'])->name('documents.download');
        Route::get('/{slug}/ip-documents/{ipDocument}', [IdeaController::class, 'downloadIpDocument'])->name('ip-documents.download');

        Route::get('/{slug}/changes', [ChangeRequestController::class, 'index'])->name('changes.index');
        Route::get('/{slug}/changes/create', [ChangeRequestController::class, 'create'])->name('changes.create');
        Route::post('/{slug}/changes', [ChangeRequestController::class, 'store'])->name('changes.store');
        Route::get('/{slug}/changes/{changeRequest}', [ChangeRequestController::class, 'show'])->name('changes.show');
        Route::post('/{slug}/changes/{changeRequest}/approve', [ChangeRequestController::class, 'approve'])->name('changes.approve');
        Route::post('/{slug}/changes/{changeRequest}/reject', [ChangeRequestController::class, 'reject'])->name('changes.reject');
        Route::delete('/{slug}/changes/{changeRequest}', [ChangeRequestController::class, 'destroy'])->name('changes.destroy');
        Route::post('/{slug}/changes/{changeRequest}/hide', [ChangeRequestController::class, 'hide'])->name('changes.hide');
        Route::post('/{slug}/changes/{changeRequest}/unhide', [ChangeRequestController::class, 'unhide'])->name('changes.unhide');

        Route::get('/{slug}/collaborations', [CollaborationController::class, 'index'])->name('collaborations.index');
        Route::post('/{slug}/collaborations', [CollaborationController::class, 'store'])->name('collaborations.store');
        Route::post('/{slug}/collaborations/{collaboration}/approve', [CollaborationController::class, 'approve'])->name('collaborations.approve');
        Route::post('/{slug}/collaborations/{collaboration}/reject', [CollaborationController::class, 'reject'])->name('collaborations.reject');

        Route::post('/{slug}/assign', [AssignmentController::class, 'store'])->name('assign');
        Route::post('/{slug}/classify', [ClassificationController::class, 'store'])->name('classify');
        Route::post('/{slug}/decide', [DecisionController::class, 'store'])->name('decide');
        Route::post('/{slug}/progress', [DecisionController::class, 'progress'])->name('progress');
        Route::post('/{slug}/request-revision', [RevisionController::class, 'requestRevision'])->name('request-revision');
        Route::post('/{slug}/resubmit', [RevisionController::class, 'resubmit'])->name('resubmit');
    });

});
