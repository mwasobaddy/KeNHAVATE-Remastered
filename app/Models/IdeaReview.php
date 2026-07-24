<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class IdeaReview extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'idea_id',
        'reviewer_id',
        'stage',
        'action',
        'notes',
        'document_path',
    ];

    public function idea(): BelongsTo
    {
        return $this->belongsTo(Idea::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }
}
