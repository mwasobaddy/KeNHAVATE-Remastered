<?php

namespace App\Services\Ideas;

use App\Mail\CollaborationApprovedMail;
use App\Mail\CollaborationRejectedMail;
use App\Mail\CollaborationRequestedMail;
use App\Models\CollaborationRequest;
use App\Models\Idea;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Mail;

class CollaborationRequestService
{
    public function __construct(
        private AuditService $auditService,
    ) {}

    public function request(User $requester, Idea $idea, string $message): CollaborationRequest
    {
        abort_if(! $idea->collaboration_enabled, 422, 'This idea does not accept collaboration requests.');

        if ($idea->author_id === $requester->id) {
            abort(422, 'You cannot request collaboration on your own idea.');
        }

        $existing = CollaborationRequest::where('idea_id', $idea->id)
            ->where('user_id', $requester->id)
            ->where('status', 'pending')
            ->exists();

        abort_if($existing, 422, 'You already have a pending request for this idea.');

        $collaborationRequest = CollaborationRequest::create([
            'idea_id' => $idea->id,
            'user_id' => $requester->id,
            'message' => $message,
            'status' => 'pending',
        ]);

        $this->auditService->log(
            $requester,
            'collaboration_requested',
            "Requested collaboration on idea: {$idea->title}",
        );

        Mail::to($idea->author)->send(new CollaborationRequestedMail($collaborationRequest));

        return $collaborationRequest;
    }

    public function approve(CollaborationRequest $collaborationRequest, User $reviewer, ?string $feedback = null): CollaborationRequest
    {
        $collaborationRequest->update([
            'status' => 'approved',
            'reviewed_by' => $reviewer->id,
            'feedback' => $feedback,
        ]);

        $idea = $collaborationRequest->idea;
        $requester = $collaborationRequest->user;

        $idea->assignRole($requester, 'collaborator');

        $this->auditService->log(
            $reviewer,
            'collaboration_approved',
            "Approved collaboration request for {$requester->name} on idea: {$idea->title}",
        );

        Mail::to($requester)->send(new CollaborationApprovedMail($collaborationRequest));

        return $collaborationRequest->fresh();
    }

    public function reject(CollaborationRequest $collaborationRequest, User $reviewer, string $feedback): CollaborationRequest
    {
        $collaborationRequest->update([
            'status' => 'rejected',
            'reviewed_by' => $reviewer->id,
            'feedback' => $feedback,
        ]);

        $this->auditService->log(
            $reviewer,
            'collaboration_rejected',
            "Rejected collaboration request for {$collaborationRequest->user->name} on idea: {$collaborationRequest->idea->title}",
        );

        Mail::to($collaborationRequest->user)->send(new CollaborationRejectedMail($collaborationRequest));

        return $collaborationRequest->fresh();
    }

    public function getForIdea(Idea $idea, int $perPage = 20): LengthAwarePaginator
    {
        return CollaborationRequest::with(['user', 'reviewer'])
            ->where('idea_id', $idea->id)
            ->latest()
            ->paginate($perPage);
    }

    public function getPendingForIdea(Idea $idea): LengthAwarePaginator
    {
        return CollaborationRequest::with('user')
            ->where('idea_id', $idea->id)
            ->where('status', 'pending')
            ->latest()
            ->paginate(20);
    }

    public function getInbox(User $user, int $perPage = 15): LengthAwarePaginator
    {
        return CollaborationRequest::with(['user', 'idea', 'reviewer'])
            ->whereHas('idea', fn (Builder $q) => $q->where('author_id', $user->id))
            ->latest()
            ->paginate($perPage)
            ->appends(request()->query());
    }

    public function getOutbox(User $user, int $perPage = 15): LengthAwarePaginator
    {
        return CollaborationRequest::with(['idea.author', 'reviewer'])
            ->where('user_id', $user->id)
            ->latest()
            ->paginate($perPage)
            ->appends(request()->query());
    }
}
