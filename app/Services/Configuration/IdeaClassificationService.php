<?php

namespace App\Services\Configuration;

use App\Models\IdeaClassification;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class IdeaClassificationService
{
    public function list(string $search = '', array $filters = []): LengthAwarePaginator
    {
        return IdeaClassification::with('createdBy')
            ->when($search, fn ($q) => $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            }))
            ->latest()
            ->paginate(20);
    }

    public function create(array $data): IdeaClassification
    {
        return IdeaClassification::create([
            ...$data,
            'slug' => Str::slug($data['name']),
            'created_by' => auth()->id(),
        ]);
    }

    public function update(IdeaClassification $ideaClassification, array $data): IdeaClassification
    {
        if (isset($data['name']) && $data['name'] !== $ideaClassification->name) {
            $data['slug'] = Str::slug($data['name']);
        }

        $ideaClassification->update($data);

        return $ideaClassification->fresh();
    }

    public function delete(IdeaClassification $ideaClassification): void
    {
        $ideaClassification->delete();
    }
}
