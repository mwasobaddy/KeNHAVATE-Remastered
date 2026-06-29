<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChangeRequest extends Model
{
    protected $fillable = [
        'idea_id',
        'user_id',
        'proposed_data',
        'notes',
        'status',
        'reviewed_by',
        'feedback',
    ];

    protected function casts(): array
    {
        return [
            'proposed_data' => 'array',
        ];
    }

    public function idea(): BelongsTo
    {
        return $this->belongsTo(Idea::class);
    }

    public function proposer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
