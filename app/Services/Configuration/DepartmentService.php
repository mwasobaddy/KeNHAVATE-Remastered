<?php

namespace App\Services\Configuration;

use App\Models\Department;
use App\Models\Directorate;
use Illuminate\Pagination\LengthAwarePaginator;

class DepartmentService
{
    public function list(string $search = '', array $filters = []): LengthAwarePaginator
    {
        return Department::with('directorate.region', 'createdBy')
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
            'directorates' => Directorate::with('region')->get(['id', 'name', 'code']),
        ];
    }

    public function create(array $data): Department
    {
        return Department::create([
            ...$data,
            'created_by' => auth()->id(),
        ]);
    }

    public function update(Department $department, array $data): Department
    {
        $department->update($data);

        return $department->fresh();
    }

    public function delete(Department $department): void
    {
        $department->delete();
    }
}
