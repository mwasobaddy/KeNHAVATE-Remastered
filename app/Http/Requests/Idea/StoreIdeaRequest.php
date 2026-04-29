<?php

namespace App\Http\Requests\Idea;

use App\Rules\SafePdf;
use Illuminate\Foundation\Http\FormRequest;

class StoreIdeaRequest extends FormRequest
{
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
            'attachment' => ['required', 'file', 'mimes:pdf', new SafePdf],
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
