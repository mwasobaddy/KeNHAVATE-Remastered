<?php

namespace App\Http\Requests\Users;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('user.edit');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('users')->ignore($this->route('user'))],
            'password' => ['nullable', 'string', 'min:8'],
            'mobile_number' => ['nullable', 'string', Rule::unique('users')->ignore($this->route('user'))],
            'gender' => ['nullable', 'string', Rule::in(['Male', 'Female'])],
            'role' => ['required', 'string', Rule::exists('roles', 'name')->where(fn ($q) => $q->whereNull('team_id'))],
            'is_staff' => ['nullable', 'boolean'],
            'region_id' => ['nullable', 'integer', 'exists:regions,id'],
            'directorate_id' => ['nullable', 'integer', 'exists:directorates,id'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'contract_type_id' => ['nullable', 'integer', 'exists:contract_types,id'],
            'designation' => ['nullable', 'string', 'max:255'],
        ];
    }
}
