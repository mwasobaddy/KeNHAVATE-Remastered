<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLikeRequest;
use App\Models\Comment;
use App\Models\Idea;
use App\Models\Like;
use Illuminate\Http\JsonResponse;

class LikeController extends Controller
{
    /**
     * Toggle like on an idea or comment.
     */
    public function store(StoreLikeRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $likeableType = $validated['likeable_type'];
        $likeableId = $validated['likeable_id'];
        $userId = $request->user()->id;

        // Find the likeable model
        $likeable = match ($likeableType) {
            'idea' => Idea::findOrFail($likeableId),
            'comment' => Comment::findOrFail($likeableId),
            default => abort(422, 'Invalid likeable type'),
        };

        // Check if already liked
        $existingLike = Like::where('user_id', $userId)
            ->where('likeable_id', $likeableId)
            ->where('likeable_type', get_class($likeable))
            ->first();

        if ($existingLike) {
            $existingLike->delete();

            return response()->json([
                'liked' => false,
                'likes_count' => $likeable->likes()->count(),
            ]);
        }

        Like::create([
            'user_id' => $userId,
            'likeable_id' => $likeableId,
            'likeable_type' => get_class($likeable),
        ]);

        return response()->json([
            'liked' => true,
            'likes_count' => $likeable->likes()->count(),
        ]);
    }
}
