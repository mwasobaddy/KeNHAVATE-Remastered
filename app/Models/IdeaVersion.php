<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IdeaVersion extends Model
{
    protected $fillable = [
        'idea_id',
        'revision_number',
        'data',
        'user_id',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function idea(): BelongsTo
    {
        return $this->belongsTo(Idea::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
