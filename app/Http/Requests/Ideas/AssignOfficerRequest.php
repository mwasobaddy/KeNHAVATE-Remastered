<?php

namespace App\Http\Requests\Ideas;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignOfficerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('idea.assign_officer') ?? false;
    }

    public function rules(): array
    {
        return [
            'officer_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id'),
            ],
        ];
    }
}
