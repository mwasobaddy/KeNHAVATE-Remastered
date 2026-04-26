<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use Laravel\Fortify\Fortify;
use Spatie\Permission\Models\Role;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            Fortify::username() => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => $this->passwordRules(),
        ])->validate();

        $user = User::create([
            'first_name' => '',
            'email' => $input['email'],
            'password' => Hash::make($input['password']),
            'onboarding_completed' => false,
        ]);

        // Assign 'user' role to all registered users
        $user->assignRole('user');

        return $user;
    }
}
