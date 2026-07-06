<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OtpCode extends Model
{
    protected $fillable = [
        'user_id',
        'email',
        'otp',
        'type',
        'attempts',
        'used_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'otp' => 'encrypted',
            'used_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeForEmail($query, string $email)
    {
        return $query->where('email', $email);
    }

    public function scopeType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeUnused($query)
    {
        return $query->whereNull('used_at');
    }

    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<', now());
    }
}
