<?php

namespace App\Http\Requests\Ideas;

use App\Models\Idea;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ClassifyIdeaRequest extends FormRequest
{
    public function authorize(): bool
    {
        $slug = $this->route('slug');

        if (! $slug) {
            return false;
        }

        $idea = Idea::where('slug', $slug)->first();

        return $idea
            && $this->user()?->can('idea.classify')
            && $idea->assigned_officer_id === $this->user()?->id;
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
