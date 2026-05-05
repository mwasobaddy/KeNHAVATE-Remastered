<?php

namespace App\Http\Controllers;

use App\Models\DdReview;
use App\Models\Idea;
use App\Models\User;
use App\Notifications\DdReviewUnlocked;
use App\Notifications\FeedbackSent;
use App\Notifications\IdeaApproved;
use App\Notifications\IdeaRejected;
use App\Services\DdReviewService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class DdReviewController extends Controller
{
    public function __construct(
        private DdReviewService $reviewService
    ) {}

    public function index(): Response
    {
        $user = auth()->user();

        $draftIdeas = Idea::where('status', 'draft')
            ->with('user', 'thematicArea')
            ->latest()
            ->get();

        $ddReviewedIdeas = Idea::whereIn('status', ['dd_approved', 'dd_rejected'])
            ->with('user', 'thematicArea', 'ddReview', 'smeReviews')
            ->latest()
            ->get();

        $smeReviewedIdeas = Idea::where('status', 'stage 1 review')
            ->orWhere(function ($query) {
                $query->whereIn('status', ['approved', 'rejected'])
                    ->whereHas('smeReviews', function ($q) {
                        $q->whereNotNull('review_comments');
                    });
            })
            ->with('user', 'thematicArea', 'smeReviews', 'ddReview')
            ->latest()
            ->get();

        $stage1Revised = Idea::where('status', 'stage 1 revise')
            ->with('user', 'thematicArea', 'smeReviews')
            ->latest()
            ->get();

        $stage2Revised = Idea::where('status', 'stage 2 revise')
            ->with('user', 'thematicArea', 'ddReview')
            ->latest()
            ->get();

        return Inertia::render('idea/ddReview/index', [
            'lockedNewIdeas' => $draftIdeas,
            'ddReviewedIdeas' => $ddReviewedIdeas,
            'smeReviewedIdeas' => $smeReviewedIdeas,
            'stage1RevisedIdeas' => $stage1Revised,
            'stage2RevisedIdeas' => $stage2Revised,
        ]);
    }

    public function create(): Response
    {
        $ideas = Idea::whereIn('status', ['draft'])
            ->with('user')
            ->get();

        return Inertia::render('idea/ddReview/create', [
            'ideas' => $ideas,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'idea_id' => ['required', 'exists:ideas,id'],
            'reviewer_id' => ['nullable', 'exists:users,id'],
            'status' => ['sometimes', 'in:pending,approved,rejected,revise'],
            'review_comments' => ['nullable', 'string'],
            'decision' => ['nullable', 'in:approve,reject'],
            'implementation_timeline' => ['nullable', 'string'],
            'budget_implications' => ['nullable', 'string'],
        ]);

        try {
            $review = $this->reviewService->create($validated);

            return redirect()->route('idea.ddReview.show', $review)
                ->with('success', 'DD Review created successfully!');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create review.']);
        }
    }

    public function show(DdReview $ddReview): Response
    {
        $review = $this->reviewService->findById($ddReview->id);

        return Inertia::render('idea/ddReview/show', [
            'review' => $review,
        ]);
    }

    public function unlock(Request $request, Idea $idea): RedirectResponse
    {
        abort_unless(auth()->user()->hasRole('deputy_director'), 403);

        $request->validate([
            'review_deadline' => ['required', 'date', 'after:now'],
        ]);

        $ddReview = DdReview::firstOrCreate(
            ['idea_id' => $idea->id],
            [
                'status' => 'pending',
                'is_unlocked' => false,
            ]
        );

        $ddReview->update([
            'is_unlocked' => true,
            'review_deadline' => $request->review_deadline,
        ]);

        $idea->update(['status' => 'stage 2 review']);

        $deputyDirector = auth()->user();
        $ideaReviewers = User::role('idea_reviewer')->get();
        $author = $idea->user;

        Notification::send($ideaReviewers, new DdReviewUnlocked($ddReview, $deputyDirector));
        Notification::send($author, new DdReviewUnlocked($ddReview, $deputyDirector));

        return redirect()->route('idea.ddReview.dashboard')
            ->with('success', 'Idea unlocked for review');
    }

    public function addComment(Request $request, Idea $idea): RedirectResponse
    {
        abort_unless(auth()->user()->hasRole('idea_reviewer'), 403);

        $ddReview = DdReview::where('idea_id', $idea->id)->firstOrFail();

        abort_unless($ddReview->is_unlocked, 403);
        abort_unless($ddReview->review_deadline && $ddReview->review_deadline->isFuture(), 403);

        $request->validate([
            'review_comments' => ['required', 'string'],
        ]);

        $ddReview->update([
            'reviewer_id' => auth()->id(),
            'review_comments' => $ddReview->review_comments
                ? $ddReview->review_comments."\n\n".auth()->user()->getFullName().': '.$request->review_comments
                : auth()->user()->getFullName().': '.$request->review_comments,
        ]);

        return back()->with('success', 'Comment added');
    }

    public function sendFeedback(Request $request, Idea $idea): JsonResponse
    {
        abort_unless(auth()->user()->hasRole('deputy_director'), 403);

        $ddReview = DdReview::where('idea_id', $idea->id)->firstOrFail();

        $request->validate([
            'feedback' => ['required', 'string'],
        ]);

        $ddReview->update([
            'feedback' => $request->feedback,
            'feedback_sent_at' => now(),
        ]);

        $author = $idea->user;
        $author->notify(new FeedbackSent($ddReview, auth()->user()));

        $teamMembers = $idea->collaborators()->get();
        foreach ($teamMembers as $member) {
            if ($member->user) {
                $member->user->notify(new FeedbackSent($ddReview, auth()->user()));
            }
        }

        return response()->json(['success' => true, 'message' => 'Feedback sent']);
    }

    public function approve(Request $request, Idea $idea): JsonResponse
    {
        abort_unless(auth()->user()->hasRole('deputy_director'), 403);

        $ddReview = DdReview::where('idea_id', $idea->id)->firstOrFail();

        $ddReview->update([
            'decision' => 'approve',
            'status' => 'approved',
        ]);

        $idea->update(['status' => 'dd_approved']);

        $author = $idea->user;
        $author->notify(new IdeaApproved($ddReview, auth()->user()));

        $teamMembers = $idea->collaborators()->get();
        foreach ($teamMembers as $member) {
            if ($member->user) {
                $member->user->notify(new IdeaApproved($ddReview, auth()->user()));
            }
        }

        return response()->json(['success' => true, 'message' => 'Idea approved']);
    }

    public function reject(Request $request, Idea $idea): JsonResponse
    {
        abort_unless(auth()->user()->hasRole('deputy_director'), 403);

        $ddReview = DdReview::where('idea_id', $idea->id)->firstOrFail();

        $ddReview->update([
            'decision' => 'reject',
            'status' => 'rejected',
        ]);

        $idea->update(['status' => 'dd_rejected']);

        $author = $idea->user;
        $author->notify(new IdeaRejected($ddReview, auth()->user()));

        $teamMembers = $idea->collaborators()->get();
        foreach ($teamMembers as $member) {
            if ($member->user) {
                $member->user->notify(new IdeaRejected($ddReview, auth()->user()));
            }
        }

        return response()->json(['success' => true, 'message' => 'Idea rejected']);
    }

    public function dashboard(): Response
    {
        abort_unless(auth()->user()->hasRole(['deputy_director', 'idea_reviewer']), 403);

        $user = auth()->user();

        if ($user->hasRole('deputy_director')) {
            $draftIdeas = Idea::where('status', 'draft')
                ->with('user', 'thematicArea')
                ->get();

            $inReviewIdeas = Idea::where('status', 'stage 2 review')
                ->with('user', 'thematicArea', 'ddReview')
                ->get();

            $allDdIdeas = Idea::whereIn('status', ['draft', 'stage 2 review', 'dd_approved', 'dd_rejected'])
                ->with('thematicArea', 'ddReview')
                ->get();

            $approvedCount = $allDdIdeas->where('status', 'dd_approved')->count();
            $rejectedCount = $allDdIdeas->where('status', 'dd_rejected')->count();
            $pendingCount = $allDdIdeas->whereIn('status', ['draft', 'stage 2 review'])->count();
            $totalCount = $allDdIdeas->count();

            $thematicDistribution = $allDdIdeas
                ->groupBy('thematic_area_id')
                ->map(fn ($group) => [
                    'name' => $group->first()?->thematicArea?->name ?? 'Unassigned',
                    'count' => $group->count(),
                ])
                ->values()
                ->toArray();

            $now = now();
            $overdue = $inReviewIdeas->filter(fn ($idea) => $idea->ddReview?->review_deadline &&
                Carbon::parse($idea->ddReview->review_deadline)->lt($now)
            )->count();

            $dueSoon = $inReviewIdeas->filter(fn ($idea) => $idea->ddReview?->review_deadline && Carbon::parse($idea->ddReview->review_deadline)->diffInDays($now) <= 3 && Carbon::parse($idea->ddReview->review_deadline)->gte($now)
            )->count();

            $onTrack = $inReviewIdeas->filter(fn ($idea) => $idea->ddReview?->review_deadline && Carbon::parse($idea->ddReview->review_deadline)->diffInDays($now) > 3
            )->count();

            return Inertia::render('idea/ddReview/dashboard', [
                'inReviewIdeas' => $inReviewIdeas,
                'stats' => [
                    'total' => $totalCount,
                    'approved' => $approvedCount,
                    'rejected' => $rejectedCount,
                    'pending' => $pendingCount,
                    'inReview' => $inReviewIdeas->count(),
                    'draft' => $draftIdeas->count(),
                    'thematicDistribution' => $thematicDistribution,
                    'deadlineStats' => [
                        'overdue' => $overdue,
                        'dueSoon' => $dueSoon,
                        'onTrack' => $onTrack,
                    ],
                ],
            ]);
        }

        if ($user->hasRole('idea_reviewer')) {
            $assignedReviews = Idea::where('status', 'stage 2 review')
                ->with('user', 'thematicArea', 'ddReview')
                ->get();

            return Inertia::render('idea/ddReview/reviewer', [
                'assignedReviews' => $assignedReviews,
            ]);
        }

        return Inertia::render('errors/403');
    }
}
