<?php

namespace App\Http\Requests\Ideas;

use Illuminate\Foundation\Http\FormRequest;

class StoreIdeaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('idea.create');
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'category_id' => ['required', 'exists:idea_categories,id'],
            'problem_statement' => ['required', 'string'],
            'proposed_solution' => ['required', 'string'],
            'cost_benefit_analysis' => ['required', 'string'],
            'proposal_file' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
            'support_documents.*' => ['nullable', 'file', 'mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png', 'max:10240'],
            'collaboration_enabled' => ['boolean'],
            'team_emails' => ['nullable', 'string'],
            'has_ip_protection' => ['required', 'boolean'],
            'patent_number' => ['nullable', 'string', 'max:255'],
            'consent_given' => ['required', 'accepted'],
            'ip_documents.*' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
        ];
    }
}
