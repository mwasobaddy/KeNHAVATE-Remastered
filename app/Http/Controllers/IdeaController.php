<?php

namespace App\Http\Controllers;

use App\Http\Requests\Idea\StoreIdeaRequest;
use App\Http\Requests\Idea\UpdateIdeaRequest;
use App\Models\Idea;
use App\Models\ThematicArea;
use App\Services\IdeaService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class IdeaController extends Controller
{
    public function __construct(
        private IdeaService $ideaService
    ) {}

    public function index(): Response
    {
        $ideas = $this->ideaService->getPaginatedForUser(
            auth()->id(),
            request()->only(['status', 'thematic_area_id'])
        );

        return Inertia::render('idea/index', [
            'ideas' => $ideas,
        ]);
    }

    public function create(): Response
    {
        $thematicAreas = ThematicArea::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('idea/create', [
            'thematicAreas' => $thematicAreas,
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
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create idea.']);
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

        return Inertia::render('idea/edit', [
            'idea' => $idea,
            'thematicAreas' => $thematicAreas,
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
