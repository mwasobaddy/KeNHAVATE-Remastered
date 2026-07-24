<?php

namespace App\Services\Ideas;

use App\Mail\IdeaInvitationMail;
use App\Mail\IdeaSubmittedConfirmationMail;
use App\Mail\NewIdeaSubmittedMail;
use App\Models\CollaborationRequest;
use App\Models\Idea;
use App\Models\IdeaDocument;
use App\Models\IdeaInvitation;
use App\Models\IdeaIpDocument;
use App\Models\IdeaIpRight;
use App\Models\Point;
use App\Models\User;
use App\Services\AuditService;
use App\Services\Points\PointAwardService;
use Illuminate\Database\Eloquent\Builder;
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

    public function create(
        User $user,
        array $data,
        ?UploadedFile $proposal = null,
        array $supportDocs = [],
        ?array $ipData = null,
        ?UploadedFile $ipDocument = null,
    ): Idea {
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
            'status' => $data['status'] ?? 'submitted',
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

        $this->handleIpData($idea, $ipData, $ipDocument);

        if (! empty($data['team_emails'])) {
            $emails = array_map('trim', explode(',', $data['team_emails']));
            $emails = array_filter($emails, fn ($e) => filter_var($e, FILTER_VALIDATE_EMAIL));
            $this->createInvitations($idea, $user, $emails);
        }

        $this->auditService->log($user, 'idea_submitted', "Created idea: {$idea->title}");

        $this->notifyReviewers($idea);

        Mail::to($user)->send(new IdeaSubmittedConfirmationMail($idea));

        return $idea;
    }

    public function update(
        Idea $idea,
        User $user,
        array $data,
        ?UploadedFile $proposal = null,
        array $supportDocs = [],
        ?array $ipData = null,
        ?UploadedFile $ipDocument = null,
    ): Idea {
        if ($proposal) {
            $idea->documents()->where('type', 'proposal')->each(fn ($doc) => $this->deleteDocument($doc));
            $this->storeDocument($idea, 'proposal', $proposal);
        }

        foreach ($supportDocs as $doc) {
            if ($doc instanceof UploadedFile) {
                $this->storeDocument($idea, 'supporting', $doc);
            }
        }

        $this->handleIpData($idea, $ipData, $ipDocument);

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

    protected function applySearchAndFilters(
        Builder $query,
        ?string $search,
        array $filters = [],
    ): Builder {
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['status'])) {
            $query->whereIn('status', $filters['status']);
        }

        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (! empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query;
    }

    public function getAll(?string $search = null, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Idea::with(['author', 'category'])->latest();

        $query = $this->applySearchAndFilters($query, $search, $filters);

        return $query->paginate($perPage)->appends(request()->query());
    }

    public function getPublic(?string $search = null, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Idea::with(['author', 'category'])
            ->whereNotIn('status', ['draft'])
            ->latest();

        $query = $this->applySearchAndFilters($query, $search, $filters);

        return $query->paginate($perPage)->appends(request()->query());
    }

    public function getMyIdeas(User $user, ?string $search = null, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Idea::with(['author', 'category'])
            ->where('author_id', $user->id)
            ->latest();

        $query = $this->applySearchAndFilters($query, $search, $filters);

        return $query->paginate($perPage)->appends(request()->query());
    }

    public function getOpenForCollaboration(User $user, ?string $search = null, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $statusSubquery = CollaborationRequest::select('status')
            ->whereColumn('idea_id', 'ideas.id')
            ->where('user_id', $user->id)
            ->latest()
            ->limit(1);

        $query = Idea::with(['author', 'category'])
            ->select('ideas.*')
            ->selectSub($statusSubquery, 'collaboration_status')
            ->where('collaboration_enabled', true)
            ->where('author_id', '!=', $user->id)
            ->latest();

        $query = $this->applySearchAndFilters($query, $search, $filters);

        return $query->paginate($perPage)->appends(request()->query());
    }

    public function getMyContributions(User $user, ?string $search = null, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $invitedIdeaIds = IdeaInvitation::where(function ($q) use ($user) {
            $q->where('email', $user->email)
                ->orWhere('user_id', $user->id);
        })
            ->where('role', 'contributor')
            ->where('status', 'accepted')
            ->pluck('idea_id');

        $query = Idea::with(['author', 'category'])
            ->whereIn('id', $invitedIdeaIds)
            ->latest();

        $query = $this->applySearchAndFilters($query, $search, $filters);

        return $query->paginate($perPage)->appends(request()->query());
    }

    public function getPendingAssignment(?string $search = null, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Idea::with(['author', 'category'])
            ->where('status', 'submitted')
            ->whereNull('assigned_officer_id')
            ->latest();

        $query = $this->applySearchAndFilters($query, $search, $filters);

        return $query->paginate($perPage)->appends(request()->query());
    }

    public function getMyQueue(User $user, ?string $search = null, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Idea::with(['author', 'category', 'assignedOfficer']);

        $query->where(function ($q) use ($user) {
            $hasClassify = $user->can('idea.classify');
            $hasDecide = $user->can('idea.record_decision');

            if ($hasClassify && $hasDecide) {
                $q->where(function ($sub) use ($user) {
                    $sub->where('assigned_officer_id', $user->id)
                        ->whereIn('status', ['assigned', 'resubmitted']);
                })->orWhere(function ($sub) use ($user) {
                    $sub->where('assigned_officer_id', $user->id)
                        ->whereIn('status', ['classified', 'resubmitted']);
                });
            } elseif ($hasClassify) {
                $q->where('assigned_officer_id', $user->id)
                    ->whereIn('status', ['assigned', 'resubmitted']);
            } elseif ($hasDecide) {
                $q->where('assigned_officer_id', $user->id)
                    ->whereIn('status', ['classified', 'resubmitted']);
            }
        });

        $query = $this->applySearchAndFilters($query, $search, $filters);

        return $query->latest()
            ->paginate($perPage)
            ->appends(request()->query());
    }

    public function getReviewed(User $user, ?string $search = null, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Idea::with(['author', 'category', 'assignedOfficer'])
            ->withWhereHas('reviews', function ($q) use ($user) {
                $q->where('reviewer_id', $user->id);
            });

        $query = $this->applySearchAndFilters($query, $search, $filters);

        return $query->latest()
            ->paginate($perPage)
            ->appends(request()->query());
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

    protected function handleIpData(Idea $idea, ?array $ipData, ?UploadedFile $ipDocument = null): void
    {
        if ($ipData === null) {
            return;
        }

        $ipRight = $idea->ipRight()->first();

        $data = [
            'has_ip_protection' => $ipData['has_ip_protection'] ?? false,
            'patent_number' => $ipData['patent_number'] ?? null,
            'status' => 'pending',
            'consent_given' => $ipData['consent_given'] ?? false,
            'consent_given_at' => now(),
        ];

        if (! $data['has_ip_protection'] && $ipRight) {
            foreach ($ipRight->documents as $doc) {
                $this->deleteIpDocument($doc);
            }
        }

        if ($ipRight) {
            $ipRight->update($data);
        } else {
            $data['idea_id'] = $idea->id;
            $ipRight = IdeaIpRight::create($data);
        }

        if ($data['has_ip_protection'] && $ipDocument instanceof UploadedFile) {
            $this->storeIpDocument($ipRight, $ipDocument);
        }
    }

    protected function storeIpDocument(IdeaIpRight $ipRight, UploadedFile $file): IdeaIpDocument
    {
        $path = $file->store('ideas/'.$ipRight->idea_id.'/ip-documents', 'local');

        return IdeaIpDocument::create([
            'idea_ip_right_id' => $ipRight->id,
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ]);
    }

    protected function deleteIpDocument(IdeaIpDocument $document): void
    {
        Storage::disk('local')->delete($document->file_path);
        $document->delete();
    }

    protected function notifyReviewers(Idea $idea): void
    {
        $reviewers = User::permission('idea.receive_new_submission_notifications')->get();

        foreach ($reviewers as $reviewer) {
            Mail::to($reviewer)->send(new NewIdeaSubmittedMail($idea));
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
