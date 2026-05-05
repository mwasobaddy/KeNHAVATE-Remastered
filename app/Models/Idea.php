<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Idea extends Model
{
    protected $fillable = [
        'idea_title',
        'slug',
        'thematic_area_id',
        'abstract',
        'problem_statement',
        'proposed_solution',
        'cost_benefit_analysis',
        'declaration_of_interests',
        'original_idea_disclaimer',
        'collaboration_enabled',
        'team_effort',
        'comments_enabled',
        'current_revision_number',
        'collaboration_deadline',
        'stage_id',
        'status_id',
        'user_id',
        'attachment_path',
    ];

    protected $casts = [
        'original_idea_disclaimer' => 'boolean',
        'collaboration_enabled' => 'boolean',
        'team_effort' => 'boolean',
        'comments_enabled' => 'boolean',
        'collaboration_deadline' => 'date',
    ];

    protected $appends = ['status_name', 'stage_name'];

    public function getStatusNameAttribute(): ?string
    {
        return $this->status?->name;
    }

    public function getStageNameAttribute(): ?string
    {
        return $this->stage?->name;
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->slug)) {
                $model->slug = static::generateUniqueSlug($model->idea_title);
            }
        });
    }

    public static function generateUniqueSlug(string $title): string
    {
        $baseSlug = Str::slug($title);
        $slug = $baseSlug;
        $counter = 1;

        while (static::where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.auth()->id().'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    public function thematicArea()
    {
        return $this->belongsTo(ThematicArea::class);
    }

    public function stage()
    {
        return $this->belongsTo(IdeaStage::class);
    }

    public function status()
    {
        return $this->belongsTo(IdeaStatus::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function smeReviews()
    {
        return $this->hasMany(SmeReview::class);
    }

    public function ddReview()
    {
        return $this->hasOne(DdReview::class);
    }

    public function teamMembers()
    {
        return $this->hasMany(TeamMember::class);
    }

    public function collaborators()
    {
        return $this->hasMany(Collaborator::class);
    }

    public function collaborationRequests()
    {
        return $this->hasMany(CollaborationRequest::class);
    }

    public function pendingCollaborationRequests()
    {
        return $this->hasMany(CollaborationRequest::class)->where('status', 'pending');
    }

    public function suggestions()
    {
        return $this->hasMany(Suggestion::class)->orderBy('created_at', 'desc');
    }

    /**
     * Get the likes for this idea.
     */
    public function likes()
    {
        return $this->morphMany(Like::class, 'likeable');
    }
}
