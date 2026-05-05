<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DdReview extends Model
{
    protected $fillable = [
        'idea_id',
        'reviewer_id',
        'status',
        'review_comments',
        'decision',
        'implementation_timeline',
        'budget_implications',
        'is_unlocked',
        'review_deadline',
        'feedback',
        'feedback_sent_at',
    ];

    protected $casts = [
        'is_unlocked' => 'boolean',
        'review_deadline' => 'datetime',
        'feedback_sent_at' => 'datetime',
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
