<?php

namespace App\Services\Configuration;

use App\Models\IdeaCategory;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class IdeaCategoryService
{
    public function list(string $search = '', array $filters = []): LengthAwarePaginator
    {
        return IdeaCategory::with('creator')
            ->when($search, fn ($q) => $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            }))
            ->latest()
            ->paginate(20);
    }

    public function create(array $data): IdeaCategory
    {
        return IdeaCategory::create([
            ...$data,
            'slug' => Str::slug($data['name']),
            'created_by' => auth()->id(),
        ]);
    }

    public function update(IdeaCategory $ideaCategory, array $data): IdeaCategory
    {
        if (isset($data['name']) && $data['name'] !== $ideaCategory->name) {
            $data['slug'] = Str::slug($data['name']);
        }

        $ideaCategory->update($data);

        return $ideaCategory->fresh();
    }

    public function delete(IdeaCategory $ideaCategory): void
    {
        $ideaCategory->delete();
    }
}
