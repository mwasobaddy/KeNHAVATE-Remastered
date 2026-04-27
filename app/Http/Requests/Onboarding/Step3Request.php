<?php

namespace App\Http\Requests\Onboarding;

use Illuminate\Foundation\Http\FormRequest;

class Step3Request extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $user = $this->user();
        $isKenhaEmail = $user && ! empty($user->work_email) && str_ends_with($user->work_email, '@kenha.co.ke');

        $rules = [
            'region_id' => ['required', 'exists:regions,id'],
            'directorate_id' => ['required', 'exists:directorates,id'],
            'department_id' => ['required', 'exists:departments,id'],
            'employment_type' => ['required', 'string', 'in:attachment,internship,contract,permanent'],
        ];

        if ($isKenhaEmail) {
            // Kenha users provide personal email in step 3
            $rules['email'] = ['required', 'string', 'email', 'max:255', 'unique:users,email', 'unique:users,work_email'];
        } else {
            // Non-Kenha users provide work email in step 3 - must be @kenha.co.ke
            $rules['work_email'] = ['required', 'string', 'email', 'max:255', 'unique:users,work_email', function ($attribute, $value, $fail) {
                if (! str_ends_with($value, '@kenha.co.ke')) {
                    $fail('The work email must be a @kenha.co.ke email address.');
                }
            }];
        }

        return $rules;
    }
}
