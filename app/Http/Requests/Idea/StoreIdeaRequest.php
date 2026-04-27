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
            'team_effort' => ['required', 'accepted'],
            'comments_enabled' => ['boolean'],
            'collaboration_deadline' => ['nullable', 'date', 'after:today'],
            'attachment' => ['required', 'file', 'mimes:pdf', 'max:10240'],
            'team_members' => ['required_if:team_effort,true', 'array'],
            'team_members.*.name' => ['required_with:team_members', 'string', 'max:255'],
            'team_members.*.email' => ['required_with:team_members', 'email', 'max:255'],
            'team_members.*.role' => ['nullable', 'string', 'max:255'],
            'team_members.*.permission' => ['required_with:team_members', 'in:view,edit'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $user = $this->user();
            $teamMembers = $this->input('team_members', []);

            foreach ($teamMembers as $index => $member) {
                $email = strtolower($member['email'] ?? '');
                $name = trim($member['name'] ?? '');
                $permission = $member['permission'] ?? 'view';

                // Check if the email belongs to the authenticated user
                $userEmail = strtolower($user->email ?? '');
                $userWorkEmail = strtolower($user->work_email ?? '');
                $userFullName = strtolower($user->getFullName());

                if ($email === $userEmail || $email === $userWorkEmail) {
                    // Verify the name matches
                    if (strtolower($name) !== $userFullName) {
                        $validator->errors()->add(
                            "team_members.{$index}.name",
                            'The name must match your full name when using your own email.'
                        );
                    }

                    // Prevent "view" permission for the author
                    if ($permission === 'view') {
                        $validator->errors()->add(
                            "team_members.{$index}.permission",
                            'As the idea author, you cannot have "view only" permission. Select "edit" instead.'
                        );
                    }
                }
            }
        });
    }
}
