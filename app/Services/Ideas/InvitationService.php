<?php

namespace App\Services\Ideas;

use App\Models\IdeaInvitation;
use App\Models\User;
use App\Services\AuditService;
use App\Services\Points\PointAwardService;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class InvitationService
{
    public function __construct(
        private AuditService $auditService,
        private PointAwardService $pointAwardService,
    ) {}

    public function findByToken(string $token): IdeaInvitation
    {
        $invitation = IdeaInvitation::where('token', $token)
            ->with(['idea', 'invitedBy'])
            ->first();

        if (! $invitation || $invitation->status !== 'pending') {
            throw new ModelNotFoundException('Invitation not found or already processed.');
        }

        return $invitation;
    }

    public function accept(IdeaInvitation $invitation, User $user): bool
    {
        if ($invitation->email !== $user->email && $invitation->email !== $user->work_email) {
            return false;
        }

        $invitation->update([
            'user_id' => $user->id,
            'status' => 'accepted',
            'token' => null,
        ]);

        $invitation->idea->assignRole($user, 'contributor');

        $this->auditService->log(
            $invitation->invitedBy,
            'team_member_added',
            "{$user->name} accepted invitation as contributor on idea: {$invitation->idea->title}",
        );

        return true;
    }

    public function getPendingForEmail(string $email): ?IdeaInvitation
    {
        return IdeaInvitation::where('email', $email)
            ->where('status', 'pending')
            ->first();
    }
}
