<?php

namespace App\Services;

use App\Models\DdReview;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class DdReviewService
{
    public function getPaginated(array $filters = []): LengthAwarePaginator
    {
        $query = DdReview::with(['idea', 'reviewer']);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['reviewer_id'])) {
            $query->where('reviewer_id', $filters['reviewer_id']);
        }

        return $query->orderBy('created_at', 'desc')->paginate(15);
    }

    public function create(array $data): DdReview
    {
        return DdReview::create($data);
    }

    public function update(DdReview $review, array $data): DdReview
    {
        $review->update($data);

        return $review->fresh();
    }

    public function findById(int $id): ?DdReview
    {
        return DdReview::with(['idea', 'reviewer'])->find($id);
    }
}
