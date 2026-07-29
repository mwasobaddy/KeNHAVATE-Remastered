<?php

namespace App\Services\Configuration;

use App\Models\ContractType;
use Illuminate\Pagination\LengthAwarePaginator;

class ContractTypeService
{
    public function list(string $search = '', array $filters = []): LengthAwarePaginator
    {
        return ContractType::with('createdBy')
            ->when($search, fn ($q) => $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            }))
            ->latest()
            ->paginate(20);
    }

    public function create(array $data): ContractType
    {
        return ContractType::create([
            ...$data,
            'created_by' => auth()->id(),
        ]);
    }

    public function update(ContractType $contractType, array $data): ContractType
    {
        $contractType->update($data);

        return $contractType->fresh();
    }

    public function delete(ContractType $contractType): void
    {
        $contractType->delete();
    }
}
