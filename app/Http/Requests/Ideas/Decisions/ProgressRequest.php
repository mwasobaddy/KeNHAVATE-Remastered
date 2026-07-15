<?php

namespace App\Http\Requests\Ideas\Decisions;

use Illuminate\Foundation\Http\FormRequest;

class ProgressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('idea.record_decision') ?? false;
    }

    public function rules(): array
    {
        return [
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
