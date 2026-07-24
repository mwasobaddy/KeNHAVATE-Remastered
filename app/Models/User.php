<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Notifications\Notification;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasRoles, Notifiable, SoftDeletes, TwoFactorAuthenticatable;

    public function authoredIdeas()
    {
        return $this->hasMany(Idea::class, 'author_id');
    }

    public function changeRequests()
    {
        return $this->hasMany(ChangeRequest::class);
    }

    public function collaborationRequests()
    {
        return $this->hasMany(CollaborationRequest::class);
    }

    public function otpCodes()
    {
        return $this->hasMany(OtpCode::class);
    }

    public function staff()
    {
        return $this->hasOne(Staff::class);
    }

    public function createdRegions()
    {
        return $this->hasMany(Region::class, 'created_by');
    }

    public function createdDirectorates()
    {
        return $this->hasMany(Directorate::class, 'created_by');
    }

    public function createdDepartments()
    {
        return $this->hasMany(Department::class, 'created_by');
    }

    public function createdContractTypes()
    {
        return $this->hasMany(ContractType::class, 'created_by');
    }

    public function pointTransactions()
    {
        return $this->hasMany(PointTransaction::class);
    }

    public function ideaInvitations()
    {
        return $this->hasMany(IdeaInvitation::class, 'invited_by');
    }

    public function pendingInvitations()
    {
        return $this->hasMany(IdeaInvitation::class, 'user_id')->where('status', 'pending');
    }

    protected $fillable = [
        'name',
        'email',
        'work_email',
        'google_id',
        'mobile_number',
        'gender',
        'password',
        'onboarding_completed_at',
        'terms_accepted',
        'points_balance',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'work_email_verified_at' => 'datetime',
            'onboarding_completed_at' => 'datetime',
            'terms_accepted' => 'boolean',
            'points_balance' => 'integer',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function routeNotificationForMail(Notification $notification): array|string
    {
        return $this->email ?? $this->work_email;
    }

    public function receivesBroadcastNotificationsOn(): array
    {
        return ['user.'.$this->id];
    }
}
