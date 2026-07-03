<?php

namespace App\Http\Requests\Ideas;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ClassifyIdeaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('idea.classify') ?? false;
    }

    public function rules(): array
    {
        return [
            'classification_id' => [
                'required',
                'integer',
                Rule::exists('idea_classifications', 'id'),
            ],
            'category_id' => [
                'nullable',
                'integer',
                Rule::exists('idea_categories', 'id'),
            ],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
