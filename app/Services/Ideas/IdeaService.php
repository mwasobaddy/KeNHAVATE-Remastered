<?php

namespace App\Services\Ideas;

use App\Mail\IdeaInvitationMail;
use App\Models\Idea;
use App\Models\IdeaDocument;
use App\Models\IdeaInvitation;
use App\Models\Point;
use App\Models\User;
use App\Services\AuditService;
use App\Services\Points\PointAwardService;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class IdeaService
{
    public function __construct(
        private AuditService $auditService,
        private PointAwardService $pointAwardService,
    ) {}

    public function create(User $user, array $data, ?UploadedFile $proposal = null, array $supportDocs = []): Idea
    {
        $idea = Idea::create([
            'title' => $data['title'],
            'slug' => $this->generateUniqueSlug(),
            'description' => $data['description'],
            'category_id' => $data['category_id'],
            'author_id' => $user->id,
            'problem_statement' => $data['problem_statement'],
            'proposed_solution' => $data['proposed_solution'],
            'cost_benefit_analysis' => $data['cost_benefit_analysis'],
            'collaboration_enabled' => $data['collaboration_enabled'] ?? true,
            'status' => $data['status'] ?? 'draft',
        ]);

        $idea->assignRole($user, 'author');

        $this->awardIdeaSubmissionPoints($user);

        if ($proposal) {
            $this->storeDocument($idea, 'proposal', $proposal);
        }

        foreach ($supportDocs as $doc) {
            if ($doc instanceof UploadedFile) {
                $this->storeDocument($idea, 'supporting', $doc);
            }
        }

        if (! empty($data['team_emails'])) {
            $emails = array_map('trim', explode(',', $data['team_emails']));
            $emails = array_filter($emails, fn ($e) => filter_var($e, FILTER_VALIDATE_EMAIL));
            $this->createInvitations($idea, $user, $emails);
        }

        $this->auditService->log($user, 'idea_submitted', "Created idea: {$idea->title}");

        return $idea;
    }

    public function update(Idea $idea, User $user, array $data, ?UploadedFile $proposal = null, array $supportDocs = []): Idea
    {
        if ($proposal) {
            $idea->documents()->where('type', 'proposal')->each(fn ($doc) => $this->deleteDocument($doc));
            $this->storeDocument($idea, 'proposal', $proposal);
        }

        foreach ($supportDocs as $doc) {
            if ($doc instanceof UploadedFile) {
                $this->storeDocument($idea, 'supporting', $doc);
            }
        }

        $idea->update($data);

        $this->auditService->log($user, 'idea_updated', "Updated idea: {$idea->title}");

        return $idea;
    }

    public function findBySlug(string $slug): ?Idea
    {
        return Idea::with(['author', 'category', 'documents'])
            ->where('slug', $slug)
            ->first();
    }

    public function getAll(int $perPage = 15): LengthAwarePaginator
    {
        return Idea::with(['author', 'category'])
            ->latest()
            ->paginate($perPage);
    }

    protected function storeDocument(Idea $idea, string $type, UploadedFile $file): IdeaDocument
    {
        $path = $file->store("ideas/{$type}s", 'local');

        return IdeaDocument::create([
            'idea_id' => $idea->id,
            'type' => $type,
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ]);
    }

    protected function deleteDocument(IdeaDocument $document): void
    {
        Storage::disk('local')->delete($document->file_path);
        $document->delete();
    }

    protected function generateUniqueSlug(): string
    {
        do {
            $slug = Str::random(11);
        } while (Idea::where('slug', $slug)->exists());

        return $slug;
    }

    protected function awardIdeaSubmissionPoints(User $user): void
    {
        $point = Point::where('name', 'Idea Submission')->first();

        if ($point && $point->is_active) {
            $this->pointAwardService->award($user, $point);
        }
    }

    protected function createInvitations(Idea $idea, User $invitedBy, array $emails): void
    {
        foreach ($emails as $email) {
            $member = User::where('email', $email)
                ->orWhere('work_email', $email)
                ->first();

            $invitation = IdeaInvitation::create([
                'idea_id' => $idea->id,
                'email' => $email,
                'user_id' => $member?->id,
                'token' => $member ? null : Str::random(32),
                'role' => 'contributor',
                'status' => $member ? 'accepted' : 'pending',
                'invited_by' => $invitedBy->id,
            ]);

            if ($member) {
                $idea->assignRole($member, 'contributor');
                $this->awardIdeaSubmissionPoints($member);
                $this->auditService->log(
                    $invitedBy,
                    'team_member_added',
                    "Added {$member->name} as contributor on idea: {$idea->title}",
                );
            } else {
                Mail::to($email)->send(new IdeaInvitationMail($invitation));
                $this->auditService->log(
                    $invitedBy,
                    'team_member_invited',
                    "Invited {$email} as contributor on idea: {$idea->title}",
                );
            }
        }
    }
}
