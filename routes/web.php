<?php

use App\Http\Controllers\Audit\AuditController;
use App\Http\Controllers\Auth\EmailLoginController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\OnboardingController;
use App\Http\Controllers\Auth\OtpVerificationController;
use App\Http\Controllers\Auth\TermsController;
use App\Http\Controllers\Configuration\ContractTypeController;
use App\Http\Controllers\Configuration\DepartmentController;
use App\Http\Controllers\Configuration\DirectorateController;
use App\Http\Controllers\Configuration\IdeaCategoryController;
use App\Http\Controllers\Configuration\IdeaClassificationController;
use App\Http\Controllers\Configuration\PointController;
use App\Http\Controllers\Configuration\RegionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeployController;
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
use App\Http\Controllers\Points\TransactionController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\Roles\RoleController;
use App\Http\Controllers\Support\BugReportController;
use App\Http\Controllers\Support\BugReportManagementController;
use App\Http\Controllers\Users\UserController;
use App\Models\ContractType;
use App\Models\Region;
use App\Models\User;
use App\Notifications\SendOtp;
use App\Services\OtpService;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

Route::get('/', [PublicController::class, 'home'])->name('home');
Route::get('how-it-works', fn () => inertia('public/how-it-works'))->name('how-it-works');
Route::get('about', fn () => inertia('public/about'))->name('about');
Route::get('contact', [PublicController::class, 'contact'])->name('contact');
Route::post('contact', [PublicController::class, 'contact']);
Route::get('explore', [PublicController::class, 'explore'])->name('explore');
Route::get('explore/{slug}', [PublicController::class, 'show'])->name('explore.show');

Route::post('build', [DeployController::class, 'build'])->middleware('deploy.token')->name('deploy.build');
Route::post('clear', [DeployController::class, 'clear'])->middleware('deploy.token')->name('deploy.clear');
Route::post('migrate', [DeployController::class, 'migrate'])->middleware('deploy.token')->name('deploy.migrate');
Route::post('migrate-fresh', [DeployController::class, 'migrateFresh'])->middleware('deploy.token')->name('deploy.migrate-fresh');
Route::post('mailtest', [DeployController::class, 'mailtest'])->middleware('deploy.token')->name('deploy.mailtest');

Route::middleware('guest')->group(function () {
    Route::get('auth/google', [GoogleAuthController::class, 'redirect'])->name('auth.google');
    Route::get('auth/google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');
    Route::post('auth/email', EmailLoginController::class)->name('auth.email');
    Route::get('auth/otp', [OtpVerificationController::class, 'create'])->name('auth.otp');
    Route::post('auth/otp/verify', [OtpVerificationController::class, 'store'])->name('auth.otp.verify');
    Route::post('auth/otp/resend', [OtpVerificationController::class, 'resend'])->name('auth.otp.resend');

    Route::inertia('auth/account-deleted', 'auth/account-deleted')->name('auth.account-deleted');

    Route::post('auth/account-deleted/start-fresh', function (Request $request) {
        $email = session('account_deleted_email');

        if (! $email) {
            return redirect()->route('login');
        }

        $flow = session('account_deleted_flow', 'otp');
        $googleName = session('account_deleted_google_name');
        $googleId = session('account_deleted_google_id');

        $oldUser = User::withTrashed()
            ->where(fn ($q) => $q->where('email', $email)->orWhere('work_email', $email))
            ->whereNotNull('deleted_at')
            ->first();

        if ($oldUser) {
            $oldUser->timestamps = false;
            $updates = ['email' => 'deleted-'.$oldUser->id.'@kenha.co.ke'];

            if ($oldUser->work_email === $email) {
                $updates['work_email'] = null;
            }

            $oldUser->update($updates);
        }

        session()->forget(['account_deleted_email', 'account_deleted_flow', 'account_deleted_google_name', 'account_deleted_google_id']);

        if ($flow === 'google') {
            $user = User::create([
                'name' => $googleName ?? Str::before($email, '@'),
                'email' => $email,
                'google_id' => $googleId,
                'email_verified_at' => now(),
                'password' => Hash::make(Str::random(32)),
            ]);

            auth()->login($user);

            return redirect()->intended(route('onboarding'))
                ->with('success', 'Welcome! Please complete your profile.');
        }

        $isKenha = str_ends_with($email, '@kenha.co.ke');

        $user = User::create([
            'name' => Str::before($email, '@'),
            'email' => $isKenha ? null : $email,
            'work_email' => $isKenha ? $email : null,
            'password' => Hash::make(Str::random(32)),
        ]);

        $otp = app(OtpService::class)->generate($email, $user);
        $user->notify(new SendOtp($otp));

        app(OtpService::class)->markCooldown($email);
        session(['otp_email' => $email]);

        return redirect()->route('auth.otp')
            ->with('success', 'OTP sent to your email.');
    })->name('auth.account-deleted.start-fresh');
});

Route::inertia('terms', 'public/terms', ['title' => 'Terms & Conditions'])->name('public.terms');
Route::inertia('privacy', 'public/privacy', ['title' => 'Privacy Policy'])->name('public.privacy');

Route::middleware('auth')->group(function () {
    Route::get('onboarding', [OnboardingController::class, 'create'])->name('onboarding');
    Route::post('onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');
});

Route::middleware('auth')->group(function () {
    Route::get('auth/terms', [TermsController::class, 'create'])->name('terms');
    Route::post('auth/terms', [TermsController::class, 'store'])->name('terms.store');
    Route::post('auth/terms/decline', [TermsController::class, 'decline'])->name('terms.decline');
});

Route::get('invitations/{token}', [InvitationController::class, 'show'])->name('invitations.show');
Route::post('invitations/accept', [InvitationController::class, 'acceptFromLogin'])->name('invitations.accept');

Route::middleware(['auth', 'verified', 'onboarding.complete', 'terms'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('settings/profile', function (Request $request) {
        return inertia('settings/index', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'activeTab' => 'profile',
            'regions' => Region::with('directorates.departments')->orderBy('name')->get(),
            'contractTypes' => ContractType::orderBy('name')->get(['id', 'name']),
        ]);
    })->name('profile.edit');
    Route::get('settings/security', function (Request $request) {
        return inertia('settings/index', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'activeTab' => 'security',
            'regions' => Region::with('directorates.departments')->orderBy('name')->get(),
            'contractTypes' => ContractType::orderBy('name')->get(['id', 'name']),
        ]);
    })->name('security.edit');
    Route::get('settings/appearance', function (Request $request) {
        return inertia('settings/index', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'activeTab' => 'appearance',
            'regions' => Region::with('directorates.departments')->orderBy('name')->get(),
            'contractTypes' => ContractType::orderBy('name')->get(['id', 'name']),
        ]);
    })->name('appearance.edit');
    Route::put('settings/profile/staff', function (Request $request) {
        $validated = $request->validate([
            'work_email' => ['nullable', 'string', 'email', 'max:255', Rule::unique('users')->ignore($request->user()->id)],
            'region_id' => ['nullable', 'exists:regions,id'],
            'directorate_id' => ['nullable', 'exists:directorates,id'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'contract_type_id' => ['nullable', 'exists:contract_types,id'],
            'designation' => ['nullable', 'string', 'max:255'],
        ]);

        $user = $request->user();

        if (isset($validated['work_email'])) {
            $user->update(['work_email' => $validated['work_email']]);
        }

        $user->staff()->updateOrCreate(
            ['user_id' => $user->id],
            collect($validated)->except('work_email')->toArray(),
        );

        return redirect()->back()->with('success', 'Staff information updated successfully.');
    })->name('staff.update');

    Route::delete('settings/profile', function (Request $request) {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        auth()->logout();

        $user->timestamps = false;
        $user->update([
            'name' => 'Deleted User',
            'mobile_number' => null,
            'gender' => null,
            'google_id' => null,
        ]);

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

    Route::prefix('regions')->name('regions.')->group(function () {
        Route::get('/', [RegionController::class, 'index'])
            ->name('index')
            ->middleware('permission:region.manage|region.create|region.edit|region.delete');

        Route::get('/create', [RegionController::class, 'create'])
            ->name('create')
            ->middleware('permission:region.create');

        Route::post('/', [RegionController::class, 'store'])
            ->name('store')
            ->middleware('permission:region.create');

        Route::get('/{region}/edit', [RegionController::class, 'edit'])
            ->name('edit')
            ->middleware('permission:region.edit');

        Route::put('/{region}', [RegionController::class, 'update'])
            ->name('update')
            ->middleware('permission:region.edit');

        Route::delete('/{region}', [RegionController::class, 'destroy'])
            ->name('destroy')
            ->middleware('permission:region.delete');
    });

    Route::prefix('directorates')->name('directorates.')->group(function () {
        Route::get('/', [DirectorateController::class, 'index'])
            ->name('index')
            ->middleware('permission:directorate.manage|directorate.create|directorate.edit|directorate.delete');

        Route::get('/create', [DirectorateController::class, 'create'])
            ->name('create')
            ->middleware('permission:directorate.create');

        Route::post('/', [DirectorateController::class, 'store'])
            ->name('store')
            ->middleware('permission:directorate.create');

        Route::get('/{directorate}/edit', [DirectorateController::class, 'edit'])
            ->name('edit')
            ->middleware('permission:directorate.edit');

        Route::put('/{directorate}', [DirectorateController::class, 'update'])
            ->name('update')
            ->middleware('permission:directorate.edit');

        Route::delete('/{directorate}', [DirectorateController::class, 'destroy'])
            ->name('destroy')
            ->middleware('permission:directorate.delete');
    });

    Route::prefix('departments')->name('departments.')->group(function () {
        Route::get('/', [DepartmentController::class, 'index'])
            ->name('index')
            ->middleware('permission:department.manage|department.create|department.edit|department.delete');

        Route::get('/create', [DepartmentController::class, 'create'])
            ->name('create')
            ->middleware('permission:department.create');

        Route::post('/', [DepartmentController::class, 'store'])
            ->name('store')
            ->middleware('permission:department.create');

        Route::get('/{department}/edit', [DepartmentController::class, 'edit'])
            ->name('edit')
            ->middleware('permission:department.edit');

        Route::put('/{department}', [DepartmentController::class, 'update'])
            ->name('update')
            ->middleware('permission:department.edit');

        Route::delete('/{department}', [DepartmentController::class, 'destroy'])
            ->name('destroy')
            ->middleware('permission:department.delete');
    });

    Route::prefix('contract-types')->name('contract-types.')->group(function () {
        Route::get('/', [ContractTypeController::class, 'index'])
            ->name('index')
            ->middleware('permission:contract_type.manage|contract_type.create|contract_type.edit|contract_type.delete');

        Route::get('/create', [ContractTypeController::class, 'create'])
            ->name('create')
            ->middleware('permission:contract_type.create');

        Route::post('/', [ContractTypeController::class, 'store'])
            ->name('store')
            ->middleware('permission:contract_type.create');

        Route::get('/{contractType}/edit', [ContractTypeController::class, 'edit'])
            ->name('edit')
            ->middleware('permission:contract_type.edit');

        Route::put('/{contractType}', [ContractTypeController::class, 'update'])
            ->name('update')
            ->middleware('permission:contract_type.edit');

        Route::delete('/{contractType}', [ContractTypeController::class, 'destroy'])
            ->name('destroy')
            ->middleware('permission:contract_type.delete');
    });

    Route::prefix('idea-categories')->name('idea-categories.')->group(function () {
        Route::get('/', [IdeaCategoryController::class, 'index'])
            ->name('index')
            ->middleware('permission:idea_category.manage|idea_category.create|idea_category.edit|idea_category.delete');

        Route::get('/create', [IdeaCategoryController::class, 'create'])
            ->name('create')
            ->middleware('permission:idea_category.create');

        Route::post('/', [IdeaCategoryController::class, 'store'])
            ->name('store')
            ->middleware('permission:idea_category.create');

        Route::get('/{ideaCategory}/edit', [IdeaCategoryController::class, 'edit'])
            ->name('edit')
            ->middleware('permission:idea_category.edit');

        Route::put('/{ideaCategory}', [IdeaCategoryController::class, 'update'])
            ->name('update')
            ->middleware('permission:idea_category.edit');

        Route::delete('/{ideaCategory}', [IdeaCategoryController::class, 'destroy'])
            ->name('destroy')
            ->middleware('permission:idea_category.delete');
    });

    Route::prefix('idea-classifications')->name('idea-classifications.')->group(function () {
        Route::get('/', [IdeaClassificationController::class, 'index'])
            ->name('index')
            ->middleware('permission:idea_classification.manage|idea_classification.create|idea_classification.edit|idea_classification.delete');

        Route::get('/create', [IdeaClassificationController::class, 'create'])
            ->name('create')
            ->middleware('permission:idea_classification.create');

        Route::post('/', [IdeaClassificationController::class, 'store'])
            ->name('store')
            ->middleware('permission:idea_classification.create');

        Route::get('/{ideaClassification}/edit', [IdeaClassificationController::class, 'edit'])
            ->name('edit')
            ->middleware('permission:idea_classification.edit');

        Route::put('/{ideaClassification}', [IdeaClassificationController::class, 'update'])
            ->name('update')
            ->middleware('permission:idea_classification.edit');

        Route::delete('/{ideaClassification}', [IdeaClassificationController::class, 'destroy'])
            ->name('destroy')
            ->middleware('permission:idea_classification.delete');
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

    Route::prefix('bug-reports')->name('bug-reports.')->group(function () {
        Route::get('/', [BugReportController::class, 'index'])->name('index');
        Route::get('/create', [BugReportController::class, 'create'])->name('create');
        Route::post('/', [BugReportController::class, 'store'])->name('store');

        Route::middleware('permission:report.manage')->group(function () {
            Route::get('/manage', [BugReportManagementController::class, 'index'])->name('manage');
            Route::post('/{bugReport}/review', [BugReportManagementController::class, 'review'])
                ->name('review')
                ->middleware('permission:report.accept|report.reject');
        });
    });

});
