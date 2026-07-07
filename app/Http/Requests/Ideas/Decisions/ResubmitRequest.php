<?php

namespace App\Http\Requests\Ideas\Decisions;

use Illuminate\Foundation\Http\FormRequest;

class ResubmitRequest extends FormRequest
{
    public function authorize(): bool
    {
        $idea = $this->route('idea');

        return $idea && $idea->author_id === $this->user()?->id;
    }

    public function rules(): array
    {
        return [
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
