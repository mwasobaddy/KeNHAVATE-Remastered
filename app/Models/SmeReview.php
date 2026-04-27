<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SmeReview extends Model
{
    protected $fillable = [
        'idea_id',
        'reviewer_id',
        'status',
        'review_comments',
        'recommendation',
        'rating',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    public function idea()
    {
        return $this->belongsTo(Idea::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }
}
