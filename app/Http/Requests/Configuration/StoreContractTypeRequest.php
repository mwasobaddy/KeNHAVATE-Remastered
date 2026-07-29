<?php

namespace App\Http\Requests\Configuration;

use Illuminate\Foundation\Http\FormRequest;

class StoreContractTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('contract_type.create');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:contract_types,name'],
            'description' => ['nullable', 'string'],
        ];
    }
}
