<?php

namespace App\Services\Configuration;

use App\Models\Region;
use Illuminate\Pagination\LengthAwarePaginator;

class RegionService
{
    public function list(string $search = '', array $filters = []): LengthAwarePaginator
    {
        return Region::with('createdBy')
            ->when($search, fn ($q) => $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            }))
            ->latest()
            ->paginate(20);
    }

    public function create(array $data): Region
    {
        return Region::create([
            ...$data,
            'created_by' => auth()->id(),
        ]);
    }

    public function update(Region $region, array $data): Region
    {
        $region->update($data);

        return $region->fresh();
    }

    public function delete(Region $region): void
    {
        $region->delete();
    }
}
