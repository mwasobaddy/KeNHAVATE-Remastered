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
