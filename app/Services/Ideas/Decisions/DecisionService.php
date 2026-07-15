<?php

namespace App\Services\Ideas\Decisions;

use App\Mail\IdeaStatusUpdated;
use App\Models\Idea;
use App\Models\IdeaReview;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Support\Facades\Mail;

class DecisionService
{
    private const DECISIONS_BY_CLASSIFICATION = [
        'innovation' => ['approved', 'deferred', 'declined'],
        'research' => ['budget_logged', 'deferred', 'closed'],
        'project' => ['budget_logged', 'deferred', 'closed'],
        'outside_mandate' => ['closed'],
    ];

    private const EXECUTION_PROGRESSION = [
        'approved' => 'in_progress',
        'in_progress' => 'completed',
        'completed' => 'implemented',
        'implemented' => 'closed',
    ];

    public function __construct(
        private AuditService $auditService,
    ) {}

    public static function getValidDecisions(Idea $idea): array
    {
        if (! $idea->classification_id || ! $idea->classification) {
            return [];
        }

        return self::DECISIONS_BY_CLASSIFICATION[$idea->classification->slug] ?? [];
    }

    public static function canDecide(Idea $idea): bool
    {
        return in_array($idea->status, ['classified', 'resubmitted'], true)
            && $idea->classification_id !== null
            && $idea->decided_at === null;
    }

    public static function canProgress(Idea $idea): bool
    {
        return array_key_exists($idea->status, self::EXECUTION_PROGRESSION);
    }

    public static function getNextStatus(string $currentStatus): ?string
    {
        return self::EXECUTION_PROGRESSION[$currentStatus] ?? null;
    }

    public function decide(Idea $idea, User $user, string $decision, ?string $notes = null, bool $budgetLogged = false): Idea
    {
        $updateData = [
            'status' => $decision,
            'decided_at' => now(),
            'decided_by_id' => $user->id,
        ];

        if ($budgetLogged) {
            $updateData['budget_logged_at'] = now();
        }

        $idea->update($updateData);

        IdeaReview::create([
            'idea_id' => $idea->id,
            'reviewer_id' => $user->id,
            'stage' => 'decision',
            'action' => $decision,
            'notes' => $notes,
        ]);

        $this->auditService->log(
            $user,
            'idea_decision',
            "Recorded decision '{$decision}' for idea: {$idea->title}",
        );

        return $idea->fresh();
    }

    public function progress(Idea $idea, User $user, ?string $notes = null): Idea
    {
        $nextStatus = self::EXECUTION_PROGRESSION[$idea->status] ?? null;

        if ($nextStatus === null) {
            throw new \InvalidArgumentException("Cannot progress idea from status: {$idea->status}");
        }

        $updateData = ['status' => $nextStatus];

        if ($nextStatus === 'completed') {
            $updateData['completed_at'] = now();
        }

        $idea->update($updateData);

        IdeaReview::create([
            'idea_id' => $idea->id,
            'reviewer_id' => $user->id,
            'stage' => 'execution',
            'action' => $nextStatus,
            'notes' => $notes,
        ]);

        Mail::to($idea->author)->send(new IdeaStatusUpdated($idea, $nextStatus));

        $this->auditService->log(
            $user,
            'idea_progressed',
            "Progressed idea '{$idea->title}' to status: {$nextStatus}",
        );

        return $idea->fresh();
    }

    public function requestRevision(Idea $idea, User $user, ?string $notes = null): Idea
    {
        $idea->update(['status' => 'revision_requested']);

        IdeaReview::create([
            'idea_id' => $idea->id,
            'reviewer_id' => $user->id,
            'stage' => 'revision',
            'action' => 'requested',
            'notes' => $notes,
        ]);

        Mail::to($idea->author)->send(new IdeaStatusUpdated($idea, 'revision_requested'));

        $this->auditService->log(
            $user,
            'revision_requested',
            "Requested revision for idea: {$idea->title}",
        );

        return $idea->fresh();
    }

    public function resubmit(Idea $idea, User $user, ?string $notes = null): Idea
    {
        $idea->update(['status' => 'resubmitted']);

        IdeaReview::create([
            'idea_id' => $idea->id,
            'reviewer_id' => $user->id,
            'stage' => 'revision',
            'action' => 'resubmitted',
            'notes' => $notes,
        ]);

        if ($idea->assignedOfficer) {
            Mail::to($idea->assignedOfficer)->send(new IdeaStatusUpdated($idea, 'resubmitted'));
        }

        $this->auditService->log(
            $user,
            'idea_resubmitted',
            "Resubmitted idea: {$idea->title}",
        );

        return $idea->fresh();
    }
}
