<?php

namespace App\Http\Controllers;

use App\Models\Idea;
use App\Models\SmeReview;
use App\Services\SmeReviewService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SmeReviewController extends Controller
{
    public function __construct(
        private SmeReviewService $reviewService
    ) {}

    public function index(): Response
    {
        $reviews = $this->reviewService->getPaginated(
            request()->only(['status', 'reviewer_id'])
        );

        return Inertia::render('idea/smeReview/index', [
            'reviews' => $reviews,
        ]);
    }

    public function create(): Response
    {
        $ideas = Idea::whereIn('status', ['stage 1 review', 'stage 1 revise'])
            ->with('user')
            ->get();

        return Inertia::render('idea/smeReview/create', [
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
            'recommendation' => ['nullable', 'in:approve,reject,revise'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
        ]);

        try {
            $review = $this->reviewService->create($validated);

            return redirect()->route('idea.smeReview.show', $review)
                ->with('success', 'SME Review created successfully!');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create review.']);
        }
    }

    public function show(SmeReview $smeReview): Response
    {
        $review = $this->reviewService->findById($smeReview->id);

        return Inertia::render('idea/smeReview/show', [
            'review' => $review,
        ]);
    }

    public function edit(SmeReview $smeReview): Response
    {
        return Inertia::render('idea/smeReview/edit', [
            'review' => $smeReview->load('idea', 'reviewer'),
        ]);
    }

    public function update(Request $request, SmeReview $smeReview): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['sometimes', 'in:pending,approved,rejected,revise'],
            'review_comments' => ['sometimes', 'nullable', 'string'],
            'recommendation' => ['sometimes', 'nullable', 'in:approve,reject,revise'],
            'rating' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:5'],
        ]);

        try {
            $this->reviewService->update($smeReview, $validated);

            return redirect()->route('idea.smeReview.show', $smeReview)
                ->with('success', 'SME Review updated successfully!');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update review.']);
        }
    }
}
