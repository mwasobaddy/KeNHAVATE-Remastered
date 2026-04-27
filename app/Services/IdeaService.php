<?php

namespace App\Services;

use App\Models\Idea;
use App\Models\TeamMember;
use App\Models\User;
use App\Notifications\TeamMemberInvitation;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class IdeaService
{
    public function getPaginatedForUser(int $userId, array $filters = []): LengthAwarePaginator
    {
        $query = Idea::with(['thematicArea', 'user'])
            ->withCount(['likes', 'comments' => function ($q) {
                $q->whereNull('parent_id');
            }])
            ->withExists(['likes as user_has_liked' => function ($q) use ($userId) {
                $q->where('user_id', $userId);
            }])
            ->where('user_id', $userId);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['thematic_area_id'])) {
            $query->where('thematic_area_id', $filters['thematic_area_id']);
        }

        return $query->orderBy('created_at', 'desc')->paginate(15);
    }

    public function getForTeamMember(int $userId, array $filters = []): LengthAwarePaginator
    {
        $query = Idea::with(['thematicArea', 'user', 'teamMembers' => function ($q) use ($userId) {
            $q->where('user_id', $userId);
        }])
            ->withCount(['likes', 'comments' => function ($q) {
                $q->whereNull('parent_id');
            }])
            ->withExists(['likes as user_has_liked' => function ($q) use ($userId) {
                $q->where('user_id', $userId);
            }])
            ->whereHas('teamMembers', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            });

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['thematic_area_id'])) {
            $query->where('thematic_area_id', $filters['thematic_area_id']);
        }

        return $query->orderBy('created_at', 'desc')->paginate(15);
    }

    public function getPublicIndex(array $filters = []): LengthAwarePaginator
    {
        $query = Idea::with(['thematicArea', 'user'])
            ->withCount(['likes', 'comments' => function ($q) {
                $q->whereNull('parent_id');
            }])
            ->withExists(['likes as user_has_liked' => function ($q) {
                $q->where('user_id', auth()->id());
            }])
            ->where('collaboration_enabled', true);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['thematic_area_id'])) {
            $query->where('thematic_area_id', $filters['thematic_area_id']);
        }

        return $query->orderBy('created_at', 'desc')->paginate(15);
    }

    public function create(array $data, int $userId): Idea
    {
        return DB::transaction(function () use ($data, $userId) {
            $teamMembers = $data['team_members'] ?? [];
            unset($data['team_members']);

            $data['user_id'] = $userId;
            $data['slug'] = $data['slug'] ?? \Str::slug($data['idea_title']);
            $data['path'] = 'idea/'.$data['slug'];

            if (isset($data['attachment'])) {
                $path = $this->storeAttachment($data['attachment']);
                $data['attachment'] = $path;
            }

            $idea = Idea::create($data);

            // Process team members if any
            if (! empty($teamMembers)) {
                $this->processTeamMembers($idea, $teamMembers, $userId);
            }

            return $idea;
        });
    }

    protected function processTeamMembers(Idea $idea, array $teamMembers, int $inviterId): void
    {
        foreach ($teamMembers as $memberData) {
            $this->processNewTeamMember($idea, $memberData, $inviterId);
        }
    }

    public function update(Idea $idea, array $data): Idea
    {
        return DB::transaction(function () use ($idea, $data) {
            $teamMembers = $data['team_members'] ?? null;
            unset($data['team_members']);

            if (isset($data['attachment'])) {
                if ($idea->attachment) {
                    Storage::disk('public')->delete($idea->attachment);
                }
                $path = $this->storeAttachment($data['attachment']);
                $data['attachment'] = $path;
            }

            $idea->update($data);

            // Process team members if provided
            if ($teamMembers !== null) {
                $this->syncTeamMembers($idea, $teamMembers, $idea->user_id);
            }

            return $idea->fresh();
        });
    }

    protected function syncTeamMembers(Idea $idea, array $teamMembers, int $inviterId): void
    {
        $existingIds = $idea->teamMembers->pluck('id')->toArray();
        $updatedIds = [];

        foreach ($teamMembers as $memberData) {
            if (! empty($memberData['id'])) {
                // Update existing team member
                $teamMember = TeamMember::find($memberData['id']);
                if ($teamMember && $teamMember->idea_id === $idea->id) {
                    $teamMember->update([
                        'name' => $memberData['name'],
                        'email' => $memberData['email'],
                        'role' => $memberData['role'] ?? null,
                        'permissions' => $memberData['permission'],
                    ]);
                    $updatedIds[] = $teamMember->id;
                }
            } else {
                // Create new team member
                $newMember = $this->processNewTeamMember($idea, $memberData, $inviterId);
                if ($newMember) {
                    $updatedIds[] = $newMember->id;
                }
            }
        }

        // Delete team members that were removed
        $idsToDelete = array_diff($existingIds, $updatedIds);
        if (! empty($idsToDelete)) {
            TeamMember::whereIn('id', $idsToDelete)->delete();
        }
    }

    protected function processNewTeamMember(Idea $idea, array $memberData, int $inviterId): ?TeamMember
    {
        $inviter = User::find($inviterId);

        // Check if user exists by email
        $user = User::where('email', $memberData['email'])
            ->orWhere('work_email', $memberData['email'])
            ->first();

        // Create user if doesn't exist
        if (! $user) {
            $nameParts = explode(' ', $memberData['name'], 2);
            $firstName = $nameParts[0];
            $otherNames = $nameParts[1] ?? null;

            $isWorkEmail = str_ends_with($memberData['email'], '@kenha.co.ke');

            $userData = [
                'first_name' => $firstName,
                'other_names' => $otherNames,
                'password' => bcrypt(\Str::random(32)),
                'onboarding_completed' => false,
            ];

            if ($isWorkEmail) {
                $userData['work_email'] = $memberData['email'];
                $userData['email'] = null;
            } else {
                $userData['email'] = $memberData['email'];
                $userData['work_email'] = null;
            }

            $user = User::create($userData);
        }

        // Create team member record
        $teamMember = TeamMember::create([
            'idea_id' => $idea->id,
            'user_id' => $user->id,
            'name' => $memberData['name'],
            'email' => $memberData['email'],
            'role' => $memberData['role'] ?? null,
            'permissions' => $memberData['permission'],
        ]);

        // Send invitation notification (skip if member is the inviter/creator)
        if ($inviterId !== $user->id) {
            try {
                $user->notify(new TeamMemberInvitation(
                    $inviter->getFullName(),
                    $idea->idea_title,
                    $memberData['role'] ?? 'Team Member',
                    $memberData['permission']
                ));
            } catch (\Exception $e) {
                Log::error('Failed to send team member invitation', [
                    'email' => $memberData['email'],
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $teamMember;
    }

    public function delete(Idea $idea): void
    {
        DB::transaction(function () use ($idea) {
            if ($idea->attachment) {
                Storage::disk('public')->delete($idea->attachment);
            }
            $idea->delete();
        });
    }

    public function findById(int $id): ?Idea
    {
        return Idea::with(['thematicArea', 'user', 'comments.user', 'smeReviews', 'ddReviews', 'teamMembers'])->find($id);
    }

    protected function storeAttachment($file): string
    {
        return Storage::disk('public')->put('ideas/attachments', $file);
    }
}
