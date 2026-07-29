<?php

namespace App\Http\Requests\Configuration;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDirectorateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('directorate.edit');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:directorates,code,'.$this->route('directorate')],
            'description' => ['nullable', 'string'],
            'region_id' => ['required', 'exists:regions,id'],
            'is_active' => ['boolean'],
        ];
    }
}
