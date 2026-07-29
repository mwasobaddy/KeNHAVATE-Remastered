<?php

namespace App\Http\Requests\Support;

use Illuminate\Foundation\Http\FormRequest;

class ReviewBugReportRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'action' => ['required', 'in:accept,reject'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
