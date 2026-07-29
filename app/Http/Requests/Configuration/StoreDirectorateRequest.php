<?php

namespace App\Http\Requests\Configuration;

use Illuminate\Foundation\Http\FormRequest;

class StoreDirectorateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('directorate.create');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:directorates,code'],
            'description' => ['nullable', 'string'],
            'region_id' => ['required', 'exists:regions,id'],
            'is_active' => ['boolean'],
        ];
    }
}
