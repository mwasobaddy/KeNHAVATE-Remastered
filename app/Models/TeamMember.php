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
        'invitation_id',
    ];

    public function invitation()
    {
        return $this->belongsTo(TeamMemberInvitation::class, 'invitation_id');
    }

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
        return in_array($this->permissions, ['view', 'edit']);
    }

    public function canEdit(): bool
    {
        return $this->permissions === 'edit';
    }

    public function canDelete(): bool
    {
        return $this->permissions === 'edit';
    }
}
