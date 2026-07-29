<?php

namespace App\Services\Configuration;

use App\Models\Directorate;
use App\Models\Region;
use Illuminate\Pagination\LengthAwarePaginator;

class DirectorateService
{
    public function list(string $search = '', array $filters = []): LengthAwarePaginator
    {
        return Directorate::with('region', 'createdBy')
            ->when($search, fn ($q) => $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            }))
            ->latest()
            ->paginate(20);
    }

    public function getFormOptions(): array
    {
        return [
            'regions' => Region::all(['id', 'name', 'code']),
        ];
    }

    public function create(array $data): Directorate
    {
        return Directorate::create([
            ...$data,
            'created_by' => auth()->id(),
        ]);
    }

    public function update(Directorate $directorate, array $data): Directorate
    {
        $directorate->update($data);

        return $directorate->fresh();
    }

    public function delete(Directorate $directorate): void
    {
        $directorate->delete();
    }
}
