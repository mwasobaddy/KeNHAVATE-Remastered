<?php

namespace App\Services;

use App\Models\Comment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CommentService
{
    public function getForIdea(int $ideaId, array $filters = []): LengthAwarePaginator
    {
        $query = Comment::with(['user', 'replies.user'])
            ->where('idea_id', $ideaId)
            ->whereNull('parent_id');

        if (! empty($filters['is_internal'])) {
            $query->where('is_internal', $filters['is_internal']);
        }

        return $query->orderBy('created_at', 'desc')->paginate(50);
    }

    public function create(array $data): Comment
    {
        return Comment::create($data);
    }

    public function delete(Comment $comment): void
    {
        $comment->delete();
    }
}
