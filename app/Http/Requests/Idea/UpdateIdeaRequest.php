<?php

namespace App\Http\Requests\Idea;

use Illuminate\Foundation\Http\FormRequest;

class UpdateIdeaRequest extends FormRequest
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
        $ideaId = $this->route('idea')->id;

        return [
            'idea_title' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:255', 'unique:ideas,slug,'.$ideaId],
            'thematic_area_id' => ['sometimes', 'nullable', 'exists:thematic_areas,id'],
            'abstract' => ['sometimes', 'nullable', 'string'],
            'problem_statement' => ['sometimes', 'nullable', 'string'],
            'proposed_solution' => ['sometimes', 'nullable', 'string'],
            'cost_benefit_analysis' => ['sometimes', 'nullable', 'string'],
            'declaration_of_interests' => ['sometimes', 'nullable', 'string'],
            'original_idea_disclaimer' => ['sometimes', 'boolean'],
            'collaboration_enabled' => ['sometimes', 'boolean'],
            'team_effort' => ['sometimes', 'boolean'],
            'comments_enabled' => ['sometimes', 'boolean'],
            'collaboration_deadline' => ['sometimes', 'nullable', 'date', 'after:today'],
            'attachment' => ['sometimes', 'nullable', 'file', 'max:10240'],
            'status' => ['sometimes', 'in:draft,stage 1 review,stage 2 review,stage 1 revise,stage 2 revise,approved,rejected'],
        ];
    }
}
