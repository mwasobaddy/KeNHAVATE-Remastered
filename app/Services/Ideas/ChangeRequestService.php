<?php

namespace App\Services\Ideas;

use App\Mail\ChangeRequestApprovedMail;
use App\Mail\ChangeRequestRejectedMail;
use App\Mail\ChangeRequestSubmittedMail;
use App\Models\ChangeRequest;
use App\Models\Idea;
use App\Models\User;
use App\Services\AuditService;
use App\Services\Support\SendsMailSafely;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class ChangeRequestService
{
    use SendsMailSafely;

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

        $this->sendMailSafely('change_request_submitted', fn () => Mail::to($idea->author)->send(new ChangeRequestSubmittedMail($changeRequest)));

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

        $this->sendMailSafely('change_request_approved', fn () => Mail::to($changeRequest->proposer)->send(new ChangeRequestApprovedMail($changeRequest)));

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

        $this->sendMailSafely('change_request_rejected', fn () => Mail::to($changeRequest->proposer)->send(new ChangeRequestRejectedMail($changeRequest)));

        return $changeRequest->fresh();
    }

    public function hide(User $user, ChangeRequest $changeRequest): void
    {
        $changeRequest->hiddenByUsers()->syncWithoutDetaching([$user->id]);

        $this->auditService->log(
            $user,
            'change_request_hidden',
            "Hidden change request #{$changeRequest->id} from personal view",
        );
    }

    public function unhide(User $user, ChangeRequest $changeRequest): void
    {
        $changeRequest->hiddenByUsers()->detach($user->id);

        $this->auditService->log(
            $user,
            'change_request_unhidden',
            "Unhidden change request #{$changeRequest->id} from personal view",
        );
    }

    public function delete(User $user, ChangeRequest $changeRequest): void
    {
        $changeRequest->delete();

        $this->auditService->log(
            $user,
            'change_request_deleted',
            "Deleted change request #{$changeRequest->id} for idea: {$changeRequest->idea->title}",
        );
    }

    public function getForIdea(Idea $idea, ?User $user = null, int $perPage = 20): LengthAwarePaginator
    {
        $query = ChangeRequest::with(['proposer', 'reviewer'])
            ->where('idea_id', $idea->id);

        if ($user) {
            $hiddenSub = DB::table('change_request_hidden_users')
                ->whereColumn('change_request_id', 'change_requests.id')
                ->where('user_id', $user->id)
                ->selectRaw('1')
                ->limit(1);

            $query->addSelect(['hidden_by_user' => $hiddenSub]);
        }

        return $query->latest()->paginate($perPage);
    }

    public function getForReviewAll(User $user, string $search = '', bool $showAll = false, array $filters = []): LengthAwarePaginator
    {
        $hiddenSub = DB::table('change_request_hidden_users')
            ->whereColumn('change_request_id', 'change_requests.id')
            ->where('user_id', $user->id)
            ->selectRaw('1')
            ->limit(1);

        $query = ChangeRequest::with(['idea', 'proposer', 'reviewer'])
            ->where('user_id', '!=', $user->id)
            ->whereHas('idea', fn ($q) => $q->where('author_id', $user->id));

        if (! $showAll) {
            $query->where('status', 'pending');
        } elseif ($filters['status'] ?? null) {
            $query->whereIn('status', explode(',', $filters['status']));
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('idea', fn ($q) => $q->where('title', 'like', "%{$search}%"))
                    ->orWhereHas('proposer', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                    ->orWhere('status', 'like', "%{$search}%");
            });
        }

        return $query->addSelect(['hidden_by_user' => clone $hiddenSub])
            ->latest()
            ->paginate(20);
    }

    public function getForUser(User $user, string $search = '', array $filters = []): LengthAwarePaginator
    {
        $hiddenSub = DB::table('change_request_hidden_users')
            ->whereColumn('change_request_id', 'change_requests.id')
            ->where('user_id', $user->id)
            ->selectRaw('1')
            ->limit(1);

        return ChangeRequest::with(['idea', 'proposer', 'reviewer'])
            ->where('user_id', $user->id)
            ->when($search, fn ($q) => $q->where(function ($q) use ($search) {
                $q->whereHas('idea', fn ($q) => $q->where('title', 'like', "%{$search}%"))
                    ->orWhereHas('proposer', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                    ->orWhere('status', 'like', "%{$search}%");
            }))
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->whereIn('status', explode(',', $status))
            )
            ->addSelect(['hidden_by_user' => clone $hiddenSub])
            ->latest()
            ->paginate(20);
    }
}
