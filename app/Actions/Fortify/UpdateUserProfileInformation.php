<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\UpdatesUserProfileInformation;

class UpdateUserProfileInformation implements UpdatesUserProfileInformation
{
    /**
     * @throws ValidationException
     */
    public function update(User $user, array $input): void
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'mobile_number' => ['nullable', 'string', 'max:20'],
            'gender' => ['nullable', 'string', 'in:Male,Female'],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];

        if ($user->relationLoaded('staff') && $user->staff) {
            $rules['work_email'] = ['nullable', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)];
        }

        Validator::make($input, $rules)->validateWithBag('updateProfileInformation');

        $data = [
            'name' => $input['name'],
            'mobile_number' => $input['mobile_number'] ?? null,
            'gender' => $input['gender'] ?? null,
        ];

        if (isset($input['avatar']) && $input['avatar'] instanceof UploadedFile) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            $data['avatar'] = $input['avatar']->store('avatars', 'public');
        }

        if (($user->relationLoaded('staff') && $user->staff) && isset($input['work_email'])) {
            $data['work_email'] = $input['work_email'];
        }

        $user->forceFill($data)->save();

        session()->flash('success', 'Profile updated successfully.');
    }
}
