<?php

namespace App\Http\Controllers\Configuration;

use App\Http\Controllers\Controller;
use App\Http\Requests\Configuration\StoreIdeaCategoryRequest;
use App\Http\Requests\Configuration\UpdateIdeaCategoryRequest;
use App\Models\IdeaCategory;
use App\Services\Configuration\IdeaCategoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class IdeaCategoryController extends Controller
{
    public function __construct(
        private IdeaCategoryService $ideaCategoryService,
    ) {}

    public function index(Request $request): Response
    {
        return inertia('configuration/idea-categories/index', [
            'idea_categories' => $this->ideaCategoryService->list(
                $request->get('search', ''),
                $request->only(['search']),
            ),
            'filters' => $request->only(['search']),
            'search' => $request->get('search', ''),
        ]);
    }

    public function create(): Response
    {
        return inertia('configuration/idea-categories/create');
    }

    public function store(StoreIdeaCategoryRequest $request): RedirectResponse
    {
        $this->ideaCategoryService->create($request->validated());

        return redirect()->route('idea-categories.index')
            ->with('success', 'Idea category created successfully.');
    }

    public function edit(IdeaCategory $ideaCategory): Response
    {
        return inertia('configuration/idea-categories/edit', [
            'ideaCategory' => $ideaCategory,
        ]);
    }

    public function update(UpdateIdeaCategoryRequest $request, IdeaCategory $ideaCategory): RedirectResponse
    {
        $this->ideaCategoryService->update($ideaCategory, $request->validated());

        return redirect()->route('idea-categories.index')
            ->with('success', 'Idea category updated successfully.');
    }

    public function destroy(IdeaCategory $ideaCategory): RedirectResponse
    {
        $this->ideaCategoryService->delete($ideaCategory);

        return redirect()->route('idea-categories.index')
            ->with('success', 'Idea category deleted successfully.');
    }
}
