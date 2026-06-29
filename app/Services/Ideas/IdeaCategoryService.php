<?php

namespace App\Services\Ideas;

use App\Models\IdeaCategory;
use Illuminate\Support\Str;

class IdeaCategoryService
{
    public function getAll(): array
    {
        return IdeaCategory::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->toArray();
    }

    public function create(array $data, int $userId): IdeaCategory
    {
        return IdeaCategory::create([
            'name' => $data['name'],
            'slug' => $data['slug'] ?? Str::slug($data['name']),
            'description' => $data['description'] ?? null,
            'is_active' => $data['is_active'] ?? true,
            'created_by' => $userId,
        ]);
    }
}
