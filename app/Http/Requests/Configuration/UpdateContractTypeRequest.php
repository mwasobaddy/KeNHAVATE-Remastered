<?php

namespace App\Http\Requests\Configuration;

use Illuminate\Foundation\Http\FormRequest;

class UpdateContractTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('contract_type.edit');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:contract_types,name,'.$this->route('contract_type')],
            'description' => ['nullable', 'string'],
        ];
    }
}
