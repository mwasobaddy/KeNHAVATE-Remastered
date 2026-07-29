<?php

namespace App\Http\Requests\Configuration;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRegionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('region.edit');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:regions,code,'.$this->route('region')],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ];
    }
}
