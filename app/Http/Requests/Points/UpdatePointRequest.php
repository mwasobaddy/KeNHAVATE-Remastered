<?php

namespace App\Http\Requests\Points;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePointRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('points.edit');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:points,name,'.$this->route('point')],
            'description' => ['nullable', 'string'],
            'points' => ['required', 'integer', 'min:1'],
            'is_active' => ['boolean'],
        ];
    }
}
