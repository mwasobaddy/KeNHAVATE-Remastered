<?php

namespace App\Http\Requests\Ideas\Decisions;

use App\Models\Idea;
use Illuminate\Foundation\Http\FormRequest;

class StoreDecisionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $slug = $this->route('slug');

        if (! $slug) {
            return false;
        }

        $idea = Idea::where('slug', $slug)->first();

        return $idea
            && $this->user()?->can('idea.record_decision')
            && $idea->assigned_officer_id === $this->user()?->id;
    }

    public function rules(): array
    {
        return [
            'decision' => ['required', 'string'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
