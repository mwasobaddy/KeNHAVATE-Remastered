<?php

namespace App\Http\Requests;

use App\Models\Comment;
use App\Models\Idea;
use Illuminate\Foundation\Http\FormRequest;

class StoreLikeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'likeable_type' => ['required', 'in:idea,comment'],
            'likeable_id' => ['required', 'integer'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $type = $this->input('likeable_type');
            $id = $this->input('likeable_id');

            if ($type === 'idea') {
                if (! Idea::where('id', $id)->exists()) {
                    $validator->errors()->add('likeable_id', 'The selected idea does not exist.');
                }
            } elseif ($type === 'comment') {
                if (! Comment::where('id', $id)->exists()) {
                    $validator->errors()->add('likeable_id', 'The selected comment does not exist.');
                }
            }
        });
    }
}
