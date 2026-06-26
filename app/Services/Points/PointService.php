<?php

namespace App\Services\Points;

use App\Models\Point;
use Illuminate\Pagination\LengthAwarePaginator;

class PointService
{
    public function list(): LengthAwarePaginator
    {
        return Point::with('createdBy')
            ->withTrashed()
            ->latest()
            ->paginate(20);
    }

    public function create(array $data): Point
    {
        return Point::create([
            ...$data,
            'created_by' => auth()->id(),
        ]);
    }

    public function update(Point $point, array $data): Point
    {
        $point->update($data);

        return $point->fresh();
    }

    public function delete(Point $point): void
    {
        $point->delete();
    }

    public function toggleActive(Point $point): Point
    {
        $point->update(['is_active' => ! $point->is_active]);

        return $point->fresh();
    }

    public function restore(int $id): void
    {
        Point::withTrashed()->findOrFail($id)->restore();
    }
}
