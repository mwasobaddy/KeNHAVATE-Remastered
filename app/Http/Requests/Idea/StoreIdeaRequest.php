<?php

namespace App\Http\Requests\Idea;

use Illuminate\Foundation\Http\FormRequest;

class StoreIdeaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'idea_title' => ['required', 'string', 'max:255'],
            'thematic_area_id' => ['required', 'exists:thematic_areas,id'],
            'abstract' => ['required', 'string'],
            'problem_statement' => ['required', 'string'],
            'proposed_solution' => ['required', 'string'],
            'cost_benefit_analysis' => ['required', 'string'],
            'declaration_of_interests' => ['required', 'string'],
            'original_idea_disclaimer' => ['required', 'accepted'],
            'collaboration_enabled' => ['boolean'],
            'team_effort' => ['boolean'],
            'comments_enabled' => ['boolean'],
            'collaboration_deadline' => ['nullable', 'date', 'after:today'],
            'attachment' => ['required', 'file', 'mimes:pdf', 'max:10240'],
        ];
    }
}
