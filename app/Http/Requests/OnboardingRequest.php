<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OnboardingRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'other_names' => ['nullable', 'string', 'max:255'],
            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('users')->ignore($this->user()->id),
                function ($attribute, $value, $fail) {
                    if ($value === $this->user()->work_email) {
                        $fail('The personal email cannot be the same as your work email.');
                    }
                },
            ],
            'mobile_number' => ['required', 'string', 'max:20'],
            'gender' => ['required', Rule::in(['male', 'female', 'other'])],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'is_staff' => ['boolean'],
            'region_id' => ['required_if:is_staff,1', 'exists:regions,id'],
            'directorate_id' => ['required_if:is_staff,1', 'exists:directorates,id'],
            'department_id' => ['required_if:is_staff,1', 'exists:departments,id'],
            'contract_type_id' => ['required_if:is_staff,1', 'exists:contract_types,id'],
            'designation' => ['required_if:is_staff,1', 'string', 'max:255'],
        ];
    }

    public function attributes(): array
    {
        return [
            'region_id' => 'region',
            'directorate_id' => 'directorate',
            'department_id' => 'department',
            'contract_type_id' => 'contract type',
        ];
    }

    public function messages(): array
    {
        return [
            'region_id.required_if' => 'The :attribute field is required since you are a staff.',
            'directorate_id.required_if' => 'The :attribute field is required since you are a staff.',
            'department_id.required_if' => 'The :attribute field is required since you are a staff.',
            'contract_type_id.required_if' => 'The :attribute field is required since you are a staff.',
            'designation.required_if' => 'The :attribute field is required since you are a staff.',
        ];
    }
}
