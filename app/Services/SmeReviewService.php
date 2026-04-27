<?php

namespace App\Services;

use App\Models\SmeReview;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SmeReviewService
{
    public function getPaginated(array $filters = []): LengthAwarePaginator
    {
        $query = SmeReview::with(['idea', 'reviewer']);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['reviewer_id'])) {
            $query->where('reviewer_id', $filters['reviewer_id']);
        }

        return $query->orderBy('created_at', 'desc')->paginate(15);
    }

    public function create(array $data): SmeReview
    {
        return SmeReview::create($data);
    }

    public function update(SmeReview $review, array $data): SmeReview
    {
        $review->update($data);

        return $review->fresh();
    }

    public function findById(int $id): ?SmeReview
    {
        return SmeReview::with(['idea', 'reviewer'])->find($id);
    }
}
