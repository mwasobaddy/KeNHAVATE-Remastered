<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeamMember extends Model
{
    protected $fillable = [
        'idea_id',
        'user_id',
        'name',
        'email',
        'role',
        'permissions',
    ];

    protected $casts = [
        'permissions' => 'array',
    ];

    public function idea()
    {
        return $this->belongsTo(Idea::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function canView(): bool
    {
        return in_array('view', $this->permissions ?? []);
    }

    public function canEdit(): bool
    {
        return in_array('edit', $this->permissions ?? []);
    }

    public function canDelete(): bool
    {
        return in_array('delete', $this->permissions ?? []);
    }
}
