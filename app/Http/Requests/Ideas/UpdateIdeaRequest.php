<?php

namespace App\Http\Requests\Ideas;

use App\Models\Idea;
use Illuminate\Foundation\Http\FormRequest;

class UpdateIdeaRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge(['idea' => $this->route('idea')]);
    }

    public function authorize(): bool
    {
        $idea = $this->route('idea');

        return $idea instanceof Idea && $idea->userCan($this->user(), 'idea.edit');
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string'],
            'category_id' => ['sometimes', 'required', 'exists:idea_categories,id'],
            'problem_statement' => ['sometimes', 'required', 'string'],
            'proposed_solution' => ['sometimes', 'required', 'string'],
            'cost_benefit_analysis' => ['sometimes', 'required', 'string'],
            'proposal_file' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
            'support_documents.*' => ['nullable', 'file', 'mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png', 'max:10240'],
            'collaboration_enabled' => ['boolean'],
            'status' => ['sometimes', 'required', 'in:draft,submitted,approved,rejected'],
        ];
    }
}
