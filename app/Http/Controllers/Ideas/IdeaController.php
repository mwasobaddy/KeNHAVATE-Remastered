<?php

namespace App\Http\Controllers\Ideas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ideas\StoreIdeaRequest;
use App\Http\Requests\Ideas\UpdateIdeaRequest;
use App\Services\Ideas\IdeaCategoryService;
use App\Services\Ideas\IdeaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class IdeaController extends Controller
{
    public function __construct(
        private IdeaService $ideaService,
        private IdeaCategoryService $ideaCategoryService,
    ) {}

    public function index(): Response
    {
        return inertia('ideas/index', [
            'ideas' => $this->ideaService->getAll(),
        ]);
    }

    public function create(): Response
    {
        return inertia('ideas/create', [
            'categories' => $this->ideaCategoryService->getAll(),
        ]);
    }

    public function store(StoreIdeaRequest $request): RedirectResponse
    {
        $idea = $this->ideaService->create(
            $request->user(),
            $request->safe()->except(['proposal_file', 'support_documents']),
            $request->file('proposal_file'),
            $request->file('support_documents', []),
        );

        return redirect()->route('ideas.show', $idea->slug)
            ->with('success', 'Idea created successfully!');
    }

    public function show(string $slug): Response
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            abort(404);
        }

        return inertia('ideas/show', [
            'idea' => $idea->load(['author', 'category', 'invitations']),
        ]);
    }

    public function edit(string $slug): Response
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            abort(404);
        }

        if (! $idea->userCan(request()->user(), 'idea.edit')) {
            abort(403);
        }

        return inertia('ideas/edit', [
            'idea' => $idea,
            'categories' => $this->ideaCategoryService->getAll(),
        ]);
    }

    public function update(UpdateIdeaRequest $request, string $slug): RedirectResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            abort(404);
        }

        $this->ideaService->update(
            $idea,
            $request->user(),
            $request->safe()->except(['proposal_file', 'support_documents']),
            $request->file('proposal_file'),
            $request->file('support_documents', []),
        );

        return redirect()->route('ideas.show', $idea->slug)
            ->with('success', 'Idea updated successfully!');
    }

    public function downloadProposal(string $slug): StreamedResponse|RedirectResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea || ! $idea->proposal_file_path) {
            abort(404);
        }

        if (! Storage::disk('local')->exists($idea->proposal_file_path)) {
            abort(404);
        }

        return Storage::disk('local')->download($idea->proposal_file_path);
    }

    public function downloadSupportDocument(string $slug, int $index): StreamedResponse|RedirectResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea || ! $idea->support_documents || ! isset($idea->support_documents[$index])) {
            abort(404);
        }

        $path = $idea->support_documents[$index];

        if (! Storage::disk('local')->exists($path)) {
            abort(404);
        }

        return Storage::disk('local')->download($path);
    }

    public function destroy(string $slug): RedirectResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            abort(404);
        }

        if (! $idea->userCan(request()->user(), 'idea.delete')) {
            abort(403);
        }

        $idea->delete();

        return redirect()->route('ideas.index')
            ->with('success', 'Idea deleted successfully.');
    }
}
