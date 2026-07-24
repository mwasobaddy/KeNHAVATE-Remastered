<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;

test('security tab is displayed', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $user = User::factory()->onboarded()->create();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('profile.edit'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/index')
            ->where('canManageTwoFactor', true)
            ->where('twoFactorEnabled', false),
        );
});

test('settings page provides two factor confirmation state when enabled', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    $user = User::factory()->onboarded()->create();

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $this->actingAs($user)
        ->get(route('profile.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/index')
            ->where('twoFactorConfirmsPassword', true),
        );
});

test('settings page provides two factor confirmation state when disabled', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    $user = User::factory()->onboarded()->create();

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => false,
    ]);

    $this->actingAs($user)
        ->get(route('profile.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/index'),
        );
});

test('settings page renders without two factor when feature is disabled', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    config(['fortify.features' => []]);

    $user = User::factory()->onboarded()->create();

    $this->actingAs($user)
        ->get(route('profile.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/index')
            ->where('canManageTwoFactor', false),
        );
});

test('password can be updated', function () {
    $user = User::factory()->onboarded()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->put(route('user-password.update'), [
            'current_password' => 'password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    expect(Hash::check('new-password', $user->refresh()->password))->toBeTrue();
});

test('correct password must be provided to update password', function () {
    $user = User::factory()->onboarded()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->put(route('user-password.update'), [
            'current_password' => 'wrong-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

    $response
        ->assertSessionHasErrorsIn('updatePassword', ['current_password'])
        ->assertRedirect(route('profile.edit'));
});
