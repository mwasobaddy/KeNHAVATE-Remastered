<?php

namespace App\Http\Requests\Configuration;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('department.edit');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:departments,code,'.$this->route('department')],
            'description' => ['nullable', 'string'],
            'directorate_id' => ['required', 'exists:directorates,id'],
            'is_active' => ['boolean'],
        ];
    }
}
