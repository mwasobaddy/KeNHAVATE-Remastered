<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeamMemberInvitation extends Model
{
    protected $table = 'team_member_invitations';

    protected $fillable = [
        'idea_id',
        'user_id',
        'invitee_name',
        'invitee_email',
        'role',
        'permission',
        'expires_at',
        'used_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
    ];

    public function idea()
    {
        return $this->belongsTo(Idea::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
