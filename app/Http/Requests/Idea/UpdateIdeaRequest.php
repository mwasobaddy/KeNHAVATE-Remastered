<?php

namespace App\Http\Requests\Idea;

use App\Rules\SafePdf;
use Illuminate\Foundation\Http\FormRequest;

class UpdateIdeaRequest extends FormRequest
{
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
            'attachment' => ['sometimes', 'nullable', new SafePdf],
            'status_id' => ['sometimes', 'nullable', 'exists:idea_statuses,id'],
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
            $teamEffort = $this->input('team_effort');

            $isTeamEffort = in_array($teamEffort, [true, 1, '1', 'true', 'on'], true);

            if ($isTeamEffort && empty($teamMembers)) {
                $validator->errors()->add(
                    'team_members',
                    'You must add at least one team member when "team effort" is checked.'
                );

                return;
            }

            $userEmail = strtolower($user->email ?? '');
            $userWorkEmail = strtolower($user->work_email ?? '');
            $userFullName = strtolower($user->getFullName());

            $hasAddedSelf = false;

            foreach ($teamMembers as $index => $member) {
                $email = strtolower($member['email'] ?? '');
                $name = trim($member['name'] ?? '');
                $permission = $member['permission'] ?? 'view';

                if ($email === $userEmail || $email === $userWorkEmail) {
                    $hasAddedSelf = true;

                    if (strtolower($name) !== $userFullName) {
                        $validator->errors()->add(
                            "team_members.{$index}.name",
                            'The name must match your full name when using your own email.'
                        );
                    }

                    if ($permission === 'view') {
                        $validator->errors()->add(
                            "team_members.{$index}.permission",
                            'As the idea author, you cannot have "view only" permission. Select "edit" instead.'
                        );
                    }
                }
            }

            if ($isTeamEffort && ! empty($teamMembers) && ! $hasAddedSelf) {
                $validator->errors()->add(
                    'team_members',
                    'You must add yourself as a team member with your email ('.$user->email.' or '.$user->work_email.').'
                );
            }
        });
    }
}
