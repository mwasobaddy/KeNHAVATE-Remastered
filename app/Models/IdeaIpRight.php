<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class IdeaIpRight extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'idea_id',
        'has_ip_protection',
        'patent_number',
        'consent_given',
        'consent_given_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'has_ip_protection' => 'boolean',
            'consent_given' => 'boolean',
            'consent_given_at' => 'datetime',
        ];
    }

    public function idea(): BelongsTo
    {
        return $this->belongsTo(Idea::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(IdeaIpDocument::class, 'idea_ip_right_id');
    }
}
