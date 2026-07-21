<?php

namespace App\Http\Requests\Ideas;

use App\Models\Idea;
use App\Services\Ideas\IdeaService;
use Illuminate\Foundation\Http\FormRequest;

class UpdateIdeaRequest extends FormRequest
{
    public function authorize(): bool
    {
        $slug = $this->route('slug');

        if (! $slug) {
            return false;
        }

        $idea = app(IdeaService::class)->findBySlug($slug);

        return $idea instanceof Idea
            && $idea->isOpen()
            && $idea->userCan($this->user(), 'idea.edit');
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
            'proposal_file' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
            'support_documents.*' => ['nullable', 'file', 'mimes:pdf,xls,xlsx,jpg,jpeg,png', 'max:10240'],
            'collaboration_enabled' => ['boolean'],
            'status' => ['sometimes', 'required', 'in:draft,submitted,approved,rejected'],
            'has_ip_protection' => ['sometimes', 'required', 'boolean'],
            'patent_number' => ['nullable', 'string', 'max:255'],
            'consent_given' => ['sometimes', 'required', 'accepted'],
            'ip_document' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
            'resubmit_notes' => ['nullable', 'string'],
        ];
    }
}
