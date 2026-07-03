<?php

namespace App\Services\Ideas;

use App\Mail\IdeaAssignedMail;
use App\Models\Idea;
use App\Models\IdeaReview;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Support\Facades\Mail;

class AssignmentService
{
    public function __construct(
        private AuditService $auditService,
    ) {}

    public function assign(Idea $idea, User $officer, User $assignedBy): Idea
    {
        $idea->update([
            'assigned_officer_id' => $officer->id,
            'assigned_at' => now(),
            'status' => 'assigned',
        ]);

        IdeaReview::create([
            'idea_id' => $idea->id,
            'reviewer_id' => $assignedBy->id,
            'stage' => 'assignment',
            'action' => 'assigned',
            'notes' => "Assigned to {$officer->name}",
        ]);

        Mail::to($officer)->send(new IdeaAssignedMail($idea, $assignedBy));

        $this->auditService->log(
            $assignedBy,
            'officer_assigned',
            "Assigned {$officer->name} as RI&KM Officer for idea: {$idea->title}",
        );

        return $idea->fresh();
    }
}
