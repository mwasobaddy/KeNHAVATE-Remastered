<?php

namespace App\Services;

use App\Models\TeamMember;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class TeamMemberService
{
    public function getForIdea(int $ideaId): LengthAwarePaginator
    {
        return TeamMember::where('idea_id', $ideaId)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(20);
    }

    public function create(array $data): TeamMember
    {
        return TeamMember::create($data);
    }

    public function update(TeamMember $member, array $data): TeamMember
    {
        $member->update($data);

        return $member->fresh();
    }

    public function delete(TeamMember $member): void
    {
        $member->delete();
    }

    public function findByUserAndIdea(int $userId, int $ideaId): ?TeamMember
    {
        return TeamMember::where('user_id', $userId)
            ->where('idea_id', $ideaId)
            ->first();
    }

    public function hasPermission(int $userId, int $ideaId, string $permission): bool
    {
        $member = $this->findByUserAndIdea($userId, $ideaId);

        if (! $member) {
            return false;
        }

        return in_array($permission, $member->permissions ?? []);
    }
}
