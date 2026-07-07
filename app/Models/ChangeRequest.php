<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ChangeRequest extends Model
{
    protected static function booted(): void
    {
        static::retrieved(function (self $cr) {
            if (is_array($cr->proposed_data)) {
                $cr->proposed_data = array_values($cr->proposed_data);
            }
        });
    }

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

    public function hiddenByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'change_request_hidden_users');
    }
}
