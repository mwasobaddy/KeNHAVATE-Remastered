<?php

use App\Models\User;

test('profile page is displayed', function () {
    $user = User::factory()->onboarded()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('profile.edit'));

    $response->assertOk();
});

test('profile information can be updated', function () {
    $user = User::factory()->onboarded()->create();
    $originalEmail = $user->email;

    $response = $this
        ->actingAs($user)
        ->put(route('user-profile-information.update'), [
            'name' => 'Test User',
            'mobile_number' => '0712345678',
            'gender' => 'Male',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/');

    $user->refresh();

    expect($user->name)->toBe('Test User');
    expect($user->email)->toBe($originalEmail);
    expect($user->mobile_number)->toBe('0712345678');
    expect($user->gender)->toBe('Male');
    expect($user->email_verified_at)->not->toBeNull();
});

test('profile information can be updated with email unchanged', function () {
    $user = User::factory()->onboarded()->create();
    $originalEmail = $user->email;

    $response = $this
        ->actingAs($user)
        ->put(route('user-profile-information.update'), [
            'name' => 'Updated Name',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/');

    expect($user->fresh()->name)->toBe('Updated Name');
    expect($user->fresh()->email)->toBe($originalEmail);
    expect($user->fresh()->email_verified_at)->not->toBeNull();
});

test('user can delete their account', function () {
    $user = User::factory()->onboarded()->create();

    $response = $this
        ->actingAs($user)
        ->delete(route('profile.destroy'), [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home'));

    $this->assertGuest();
    expect($user->fresh())->toBeNull();
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->onboarded()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->delete(route('profile.destroy'), [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect(route('profile.edit'));

    expect($user->fresh())->not->toBeNull();
});
