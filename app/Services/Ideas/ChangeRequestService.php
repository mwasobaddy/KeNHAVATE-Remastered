<?php

namespace App\Services\Ideas;

use App\Mail\ChangeRequestApprovedMail;
use App\Mail\ChangeRequestRejectedMail;
use App\Mail\ChangeRequestSubmittedMail;
use App\Models\ChangeRequest;
use App\Models\Idea;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Mail;

class ChangeRequestService
{
    public function __construct(
        private AuditService $auditService,
    ) {}

    public function propose(User $proposer, Idea $idea, array $changes, ?string $notes = null): ChangeRequest
    {
        $changeRequest = ChangeRequest::create([
            'idea_id' => $idea->id,
            'user_id' => $proposer->id,
            'proposed_data' => $changes,
            'notes' => $notes,
            'status' => 'pending',
        ]);

        $this->auditService->log(
            $proposer,
            'change_requested',
            "Proposed changes to idea: {$idea->title}",
        );

        Mail::to($idea->author)->send(new ChangeRequestSubmittedMail($changeRequest));

        return $changeRequest;
    }

    public function approve(ChangeRequest $changeRequest, User $reviewer, ?string $feedback = null): ChangeRequest
    {
        $changeRequest->update([
            'status' => 'approved',
            'reviewed_by' => $reviewer->id,
            'feedback' => $feedback,
        ]);

        $idea = $changeRequest->idea;
        $changes = $changeRequest->proposed_data;

        foreach ($changes as $change) {
            if (in_array($change['field'], [
                'title', 'description', 'problem_statement',
                'proposed_solution', 'cost_benefit_analysis',
            ])) {
                $idea->update([$change['field'] => $change['new_value']]);
            }
        }

        $this->auditService->log(
            $reviewer,
            'change_approved',
            "Approved changes for idea: {$idea->title}",
        );

        Mail::to($changeRequest->proposer)->send(new ChangeRequestApprovedMail($changeRequest));

        return $changeRequest->fresh();
    }

    public function reject(ChangeRequest $changeRequest, User $reviewer, string $feedback): ChangeRequest
    {
        $changeRequest->update([
            'status' => 'rejected',
            'reviewed_by' => $reviewer->id,
            'feedback' => $feedback,
        ]);

        $this->auditService->log(
            $reviewer,
            'change_rejected',
            "Rejected changes for idea: {$changeRequest->idea->title}: {$feedback}",
        );

        Mail::to($changeRequest->proposer)->send(new ChangeRequestRejectedMail($changeRequest));

        return $changeRequest->fresh();
    }

    public function getForIdea(Idea $idea, int $perPage = 20): LengthAwarePaginator
    {
        return ChangeRequest::with(['proposer', 'reviewer'])
            ->where('idea_id', $idea->id)
            ->latest()
            ->paginate($perPage);
    }
}
