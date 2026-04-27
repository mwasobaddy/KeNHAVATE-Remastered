<?php

namespace App\Http\Controllers;

use App\Models\DdReview;
use App\Models\Idea;
use App\Services\DdReviewService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DdReviewController extends Controller
{
    public function __construct(
        private DdReviewService $reviewService
    ) {}

    public function index(): Response
    {
        $reviews = $this->reviewService->getPaginated(
            request()->only(['status', 'reviewer_id'])
        );

        return Inertia::render('idea/ddReview/index', [
            'reviews' => $reviews,
        ]);
    }

    public function create(): Response
    {
        $ideas = Idea::whereIn('status', ['stage 2 review', 'stage 2 revise'])
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
}
