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

    public function index(Request $request): Response
    {
        $user = auth()->user();

        // Get counts for each category
        $counts = [
            'pendingUnlock' => Idea::where('status_id', 2)->count(), // SUBMITTED
            'pendingSmeCompilation' => Idea::where('status_id', 5)->count(), // PENDING_DD_COMPILATION_SME
            'pendingBoardCompilation' => Idea::where('status_id', 13)->count(), // PENDING_DD_COMPILATION_BOARD
            'pendingSmeDecision' => Idea::where('status_id', 10)->count(), // PENDING_DD_DECISION
            'pendingBoardDecision' => Idea::where('status_id', 11)->count(), // PENDING_BOARD_REVIEW
            'allActive' => Idea::whereNotIn('status_id', [17, 18, 19, 20])->count(), // All non-terminal
        ];

        // Get stats for users with view dd_analytics permission
        $stats = null;
        if ($user->hasPermissionTo('view dd_analytics')) {
            $allDdIdeas = Idea::whereIn('status_id', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])
                ->with('thematicArea', 'ddReview')
                ->get();

            $inReviewIdeas = $allDdIdeas->whereIn('status_id', [3, 4, 5, 11, 12, 13]); // Active review statuses

            $stats = [
                'total' => $allDdIdeas->count(),
                'approved' => Idea::where('status_id', 18)->count(),
                'rejected' => Idea::where('status_id', 17)->count(),
                'pending' => Idea::where('status_id', 1)->count(),
                'inReview' => $inReviewIdeas->count(),
                'draft' => Idea::where('status_id', 1)->count(),
                'thematicDistribution' => $allDdIdeas
                    ->groupBy('thematic_area_id')
                    ->map(fn ($group) => [
                        'name' => $group->first()?->thematicArea?->name ?? 'Unassigned',
                        'count' => $group->count(),
                    ])
                    ->values()
                    ->toArray(),
                'deadlineStats' => [
                    'overdue' => $inReviewIdeas->filter(fn ($idea) => $idea->ddReview?->review_deadline &&
                        Carbon::parse($idea->ddReview->review_deadline)->lt(now())
                    )->count(),
                    'dueSoon' => $inReviewIdeas->filter(fn ($idea) => $idea->ddReview?->review_deadline &&
                        Carbon::parse($idea->ddReview->review_deadline)->diffInDays(now()) <= 3 &&
                        Carbon::parse($idea->ddReview->review_deadline)->gte(now())
                    )->count(),
                    'onTrack' => $inReviewIdeas->filter(fn ($idea) => $idea->ddReview?->review_deadline &&
                        Carbon::parse($idea->ddReview->review_deadline)->diffInDays(now()) > 3
                    )->count(),
                ],
            ];
        }

        return Inertia::render('idea/ddReview/index', [
            'counts' => $counts,
            'stats' => $stats,
        ]);
    }

    public function pendingUnlock(): Response
    {
        $ideas = Idea::where('status_id', 2) // SUBMITTED
            ->with('user', 'thematicArea', 'ddReview', 'status', 'stage')
            ->latest()
            ->get();

        return Inertia::render('idea/ddReview/pendingUnlock', [
            'ideas' => $ideas,
        ]);
    }

    public function pendingSmeCompilation(): Response
    {
        $ideas = Idea::where('status_id', 5) // PENDING_DD_COMPILATION_SME
            ->with('user', 'thematicArea', 'ddReview', 'smeReviews', 'status', 'stage')
            ->latest()
            ->get();

        return Inertia::render('idea/ddReview/pendingSmeCompilation', [
            'ideas' => $ideas,
        ]);
    }

    public function pendingBoardCompilation(): Response
    {
        $ideas = Idea::where('status_id', 13) // PENDING_DD_COMPILATION_BOARD
            ->with('user', 'thematicArea', 'ddReview', 'status', 'stage')
            ->latest()
            ->get();

        return Inertia::render('idea/ddReview/pendingBoardCompilation', [
            'ideas' => $ideas,
        ]);
    }

    public function pendingSmeDecision(): Response
    {
        $ideas = Idea::where('status_id', 10) // PENDING_DD_DECISION
            ->with('user', 'thematicArea', 'ddReview', 'smeReviews', 'status', 'stage')
            ->latest()
            ->get();

        return Inertia::render('idea/ddReview/pendingSmeDecision', [
            'ideas' => $ideas,
        ]);
    }

    public function pendingBoardDecision(): Response
    {
        $ideas = Idea::where('status_id', 11) // PENDING_BOARD_REVIEW
            ->with('user', 'thematicArea', 'ddReview', 'status', 'stage')
            ->latest()
            ->get();

        return Inertia::render('idea/ddReview/pendingBoardDecision', [
            'ideas' => $ideas,
        ]);
    }

    public function allActive(): Response
    {
        // All non-terminal statuses (not rejected, approved, implementation, closed)
        $terminalStatuses = [17, 18, 19, 20]; // REJECTED, BOARD_APPROVED, IMPLEMENTATION_IN_PROGRESS, CLOSED

        $ideas = Idea::whereNotIn('status_id', $terminalStatuses)
            ->with('user', 'thematicArea', 'ddReview', 'status', 'stage')
            ->latest()
            ->get();

        return Inertia::render('idea/ddReview/allActive', [
            'ideas' => $ideas,
        ]);
    }

    public function create(): Response
    {
        $ideas = Idea::where('status_id', 1) // DRAFT
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
        abort_unless(auth()->user()->hasPermissionTo('unlock dd_review'), 403);

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

        $idea->update(['status_id' => 11]); // PENDING_BOARD_REVIEW

        $deputyDirector = auth()->user();
        $ideaReviewers = User::permission('view dd_review')->get();
        $author = $idea->user;

        Notification::send($ideaReviewers, new DdReviewUnlocked($ddReview, $deputyDirector));
        Notification::send($author, new DdReviewUnlocked($ddReview, $deputyDirector));

        return redirect()->route('idea.ddReview.dashboard')
            ->with('success', 'Idea unlocked for review');
    }

    public function addComment(Request $request, Idea $idea): RedirectResponse
    {
        abort_unless(auth()->user()->hasPermissionTo('send dd_feedback'), 403);

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
        abort_unless(auth()->user()->hasPermissionTo('send dd_feedback'), 403);

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
        abort_unless(auth()->user()->hasPermissionTo('approve dd_review'), 403);

        $ddReview = DdReview::where('idea_id', $idea->id)->firstOrFail();

        $ddReview->update([
            'decision' => 'approve',
            'status' => 'approved',
        ]);

        $idea->update(['status_id' => 18]); // BOARD_APPROVED

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
        abort_unless(auth()->user()->hasPermissionTo('reject dd_review'), 403);

        $ddReview = DdReview::where('idea_id', $idea->id)->firstOrFail();

        $ddReview->update([
            'decision' => 'reject',
            'status' => 'rejected',
        ]);

        $idea->update(['status_id' => 17]); // REJECTED

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
        abort_unless(auth()->user()->hasAnyPermission(['view dd_analytics', 'view dd_review']), 403);

        $user = auth()->user();

        if ($user->hasPermissionTo('view dd_analytics')) {
            $draftIdeas = Idea::where('status_id', 1) // DRAFT
                ->with('user', 'thematicArea')
                ->get();

            $inReviewIdeas = Idea::where('status_id', 11) // PENDING_BOARD_REVIEW
                ->with('user', 'thematicArea', 'ddReview')
                ->get();

            $allDdIdeas = Idea::whereIn('status_id', [1, 11, 17, 18]) // DRAFT, PENDING_BOARD_REVIEW, REJECTED, BOARD_APPROVED
                ->with('thematicArea', 'ddReview')
                ->get();

            $approvedCount = $allDdIdeas->where('status_id', 18)->count(); // BOARD_APPROVED
            $rejectedCount = $allDdIdeas->where('status_id', 17)->count(); // REJECTED
            $pendingCount = $allDdIdeas->whereIn('status_id', [1, 11])->count(); // DRAFT, PENDING_BOARD_REVIEW
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

        if ($user->hasPermissionTo('view dd_review')) {
            $assignedReviews = Idea::where('status_id', 11) // PENDING_BOARD_REVIEW
                ->with('user', 'thematicArea', 'ddReview')
                ->get();

            return Inertia::render('idea/ddReview/reviewer', [
                'assignedReviews' => $assignedReviews,
            ]);
        }

        return Inertia::render('errors/403');
    }
}
