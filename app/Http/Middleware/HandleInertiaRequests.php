<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;
use Laravel\Fortify\Features;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        if ($user) {
            $user->load('staff.region', 'staff.directorate', 'staff.department', 'staff.contractType');
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
            ],
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'first_name' => $user->first_name,
                    'other_names' => $user->other_names,
                    'work_email' => $user->work_email,
                    'mobile_number' => $user->mobile_number,
                    'gender' => $user->gender,
                    'avatar_url' => $user->avatar ? Storage::disk('public')->url($user->avatar) : null,
                    'roles' => $user->roles->pluck('name'),
                    'permissions' => $user->getAllPermissions()->pluck('name'),
                    'points_balance' => $user->points_balance,
                    'staff' => $user->relationLoaded('staff') ? ($user->staff ? [
                        'region' => $user->staff->region?->name,
                        'region_id' => $user->staff->region_id,
                        'directorate' => $user->staff->directorate?->name,
                        'directorate_id' => $user->staff->directorate_id,
                        'department' => $user->staff->department?->name,
                        'department_id' => $user->staff->department_id,
                        'contract_type' => $user->staff->contractType?->name,
                        'contract_type_id' => $user->staff->contract_type_id,
                        'designation' => $user->staff->designation,
                    ] : null) : null,
                ] : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'canManageTwoFactor' => Features::enabled(Features::twoFactorAuthentication()),
            'twoFactorEnabled' => $user?->two_factor_confirmed_at !== null,
            'requiresConfirmation' => Features::optionEnabled(Features::twoFactorAuthentication(), 'confirm'),
            'twoFactorConfirmsPassword' => Features::optionEnabled(Features::twoFactorAuthentication(), 'confirmPassword'),
        ];
    }
}
