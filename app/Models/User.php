<?php

namespace App\Models;

use App\Notifications\VerifyWorkEmail;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['first_name', 'other_names', 'mobile_number', 'gender', 'email', 'work_email', 'password', 'google_id', 'department_id', 'employment_type', 'provider', 'provider_id', 'avatar', 'onboarding_completed', 'work_email_verified_at'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'work_email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'onboarding_completed' => 'boolean',
        ];
    }

    /**
     * Get the email for password reset notifications.
     */
    public function getEmailForPasswordReset(): string
    {
        // For @kenha.co.ke emails that have gone through onboarding, use the personal email (email field)
        // For @kenha.co.ke emails that haven't gone through onboarding, use work_email
        // For all other emails, use the email field
        if ($this->work_email && Str::endsWith($this->work_email, '@kenha.co.ke')) {
            // If onboarding is completed, use the personal email for password reset
            if ($this->onboarding_completed) {
                return $this->email;
            }

            // If onboarding is not completed, use work email for password reset
            return $this->work_email;
        }

        return $this->email;
    }

    /**
     * Get the login email (work or primary).
     */
    public function getLoginEmail(): string
    {
        return $this->work_email ?? $this->email;
    }

    /**
     * Get the user's full name.
     */
    public function getFullName(): string
    {
        return trim($this->first_name.' '.$this->other_names);
    }

    /**
     * Get the work email for verification.
     */
    public function getEmailForVerification(): string
    {
        // For @kenha.co.ke users, after onboarding, verify personal email
        if ($this->work_email && Str::endsWith($this->work_email, '@kenha.co.ke')) {
            if ($this->onboarding_completed) {
                return $this->email;
            }

            return $this->work_email;
        }

        return $this->email;
    }

    /**
     * Check if work email is verified.
     */
    public function hasVerifiedWorkEmail(): bool
    {
        return ! is_null($this->work_email_verified_at);
    }

    /**
     * Mark the work email as verified.
     */
    public function markWorkEmailAsVerified(): void
    {
        $this->forceFill([
            'work_email_verified_at' => now(),
        ])->save();
    }

    /**
     * Check if user is using Google OAuth.
     */
    public function usesGoogleOAuth(): bool
    {
        return $this->provider === 'google' && ! is_null($this->google_id);
    }

    /**
     * Check if user needs to complete onboarding.
     */
    public function needsOnboarding(): bool
    {
        return ! $this->onboarding_completed;
    }

    /**
     * Check if user is staff applicant (needs staff details).
     * Staff applicants are users with staff-related roles who haven't completed onboarding.
     */
    public function isStaffApplicant(): bool
    {
        return $this->hasRole(['staff', 'deputy_director', 'idea_reviewer', 'challenge_reviewer', 'board', 'developer', 'admin']) && ! $this->onboarding_completed;
    }

    /**
     * Get the department that the user belongs to.
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the directorate through the department.
     */
    public function directorate()
    {
        return $this->hasOneThrough(Directorate::class, Department::class, 'id', 'id', 'department_id', 'region_id');
    }

    /**
     * Get the region through the directorate.
     */
    public function region()
    {
        return $this->hasOneThrough(Region::class, Directorate::class, 'id', 'id', 'department_id', 'region_id');
    }

    /**
     * Get the department name.
     */
    public function getDepartmentNameAttribute()
    {
        return $this->department->name ?? null;
    }

    /**
     * Get the directorate name through department.
     */
    public function getDirectorateNameAttribute()
    {
        return $this->department->directorate->name ?? null;
    }

    /**
     * Get the region name through department.
     */
    public function getRegionNameAttribute()
    {
        return $this->department->directorate->region->name ?? null;
    }

    /**
     * Get the email address for mail notifications.
     */
    public function routeNotificationForMail($notification = null): string
    {
        if ($notification instanceof VerifyWorkEmail) {
            return $this->work_email;
        }

        return $this->email;
    }
}
