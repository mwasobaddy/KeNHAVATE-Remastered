<?php

namespace App\Http\Controllers;

use App\Http\Requests\Idea\StoreIdeaRequest;
use App\Http\Requests\Idea\UpdateIdeaRequest;
use App\Models\Idea;
use App\Models\ThematicArea;
use App\Services\IdeaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class IdeaController extends Controller
{
    public function __construct(
        private IdeaService $ideaService
    ) {}

    public function index(): Response
    {
        $tab = request()->get('tab', 'mine');
        $userId = auth()->id();

        $ideas = match ($tab) {
            'team' => $this->ideaService->getForTeamMember($userId, request()->only(['status', 'thematic_area_id'])),
            'public' => $this->ideaService->getPublicIndex(request()->only(['status', 'thematic_area_id'])),
            'collabo' => Idea::where('collaboration_enabled', true)
                ->where(function ($query) use ($userId) {
                    $query->where('user_id', $userId)
                        ->orWhereHas('teamMembers', function ($q) use ($userId) {
                            $q->where('user_id', $userId);
                        });
                })
                ->with('user')
                ->withCount(['teamMembers', 'likes', 'comments'])
                ->orderBy('created_at', 'desc')
                ->paginate(20),
            default => $this->ideaService->getPaginatedForUser($userId, request()->only(['status', 'thematic_area_id'])),
        };

        // Calculate tab counts efficiently
        $tabCounts = [
            'mine' => Idea::where('user_id', $userId)->count(),
            'team' => Idea::whereHas('teamMembers', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })->count(),
            'public' => Idea::where('collaboration_enabled', true)->count(),
            'collabo' => Idea::where('collaboration_enabled', true)
                ->where(function ($query) use ($userId) {
                    $query->where('user_id', $userId)
                        ->orWhereHas('teamMembers', function ($q) use ($userId) {
                            $q->where('user_id', $userId);
                        });
                })->count(),
        ];

        $thematicAreas = ThematicArea::where('is_active', true)->orderBy('sort_order')->get();

        return Inertia::render('idea/index', [
            'ideas' => $ideas,
            'thematicAreas' => $thematicAreas,
            'activeTab' => $tab,
            'tabCounts' => $tabCounts,
        ]);
    }

    public function create(): Response
    {
        $thematicAreas = ThematicArea::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $currentUser = auth()->user();

        return Inertia::render('idea/create', [
            'thematicAreas' => $thematicAreas,
            'currentUser' => [
                'name' => $currentUser->getFullName(),
                'email' => $currentUser->email,
                'work_email' => $currentUser->work_email,
            ],
        ]);
    }

    public function store(StoreIdeaRequest $request): RedirectResponse
    {
        try {
            $idea = $this->ideaService->create(
                $request->validated(),
                auth()->id()
            );

            return redirect()->route('idea.show', $idea)
                ->with('success', 'Idea created successfully!');
        } catch (\Exception $e) {
            Log::error('Failed to create idea', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create idea: '.$e->getMessage()]);
        }
    }

    public function show(Idea $idea): Response
    {
        $idea = $this->ideaService->findById($idea->id);

        return Inertia::render('idea/show', [
            'idea' => $idea,
        ]);
    }

    public function edit(Idea $idea): Response
    {
        $thematicAreas = ThematicArea::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $idea->load('teamMembers');

        $currentUser = auth()->user();

        return Inertia::render('idea/edit', [
            'idea' => $idea,
            'thematicAreas' => $thematicAreas,
            'currentUser' => [
                'name' => $currentUser->getFullName(),
                'email' => $currentUser->email,
                'work_email' => $currentUser->work_email,
            ],
        ]);
    }

    public function update(UpdateIdeaRequest $request, Idea $idea): RedirectResponse
    {
        try {
            $this->ideaService->update($idea, $request->validated());

            return redirect()->route('idea.show', $idea)
                ->with('success', 'Idea updated successfully!');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update idea.']);
        }
    }

    public function destroy(Idea $idea): RedirectResponse
    {
        try {
            $this->ideaService->delete($idea);

            return redirect()->route('idea.index')
                ->with('success', 'Idea deleted successfully!');
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Failed to delete idea.']);
        }
    }
}
