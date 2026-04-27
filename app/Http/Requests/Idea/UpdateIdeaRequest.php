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
            'team_members' => ['sometimes', 'array'],
            'team_members.*.id' => ['nullable', 'exists:team_members,id'],
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
