<?php

namespace App\Http\Controllers\Configuration;

use App\Http\Controllers\Controller;
use App\Http\Requests\Configuration\StoreIdeaClassificationRequest;
use App\Http\Requests\Configuration\UpdateIdeaClassificationRequest;
use App\Models\IdeaClassification;
use App\Services\Configuration\IdeaClassificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class IdeaClassificationController extends Controller
{
    public function __construct(
        private IdeaClassificationService $ideaClassificationService,
    ) {}

    public function index(Request $request): Response
    {
        return inertia('configuration/idea-classifications/index', [
            'idea_classifications' => $this->ideaClassificationService->list(
                $request->get('search', ''),
                $request->only(['search']),
            ),
            'filters' => $request->only(['search']),
            'search' => $request->get('search', ''),
        ]);
    }

    public function create(): Response
    {
        return inertia('configuration/idea-classifications/create');
    }

    public function store(StoreIdeaClassificationRequest $request): RedirectResponse
    {
        $this->ideaClassificationService->create($request->validated());

        return redirect()->route('idea-classifications.index')
            ->with('success', 'Idea classification created successfully.');
    }

    public function edit(IdeaClassification $ideaClassification): Response
    {
        return inertia('configuration/idea-classifications/edit', [
            'ideaClassification' => $ideaClassification,
        ]);
    }

    public function update(UpdateIdeaClassificationRequest $request, IdeaClassification $ideaClassification): RedirectResponse
    {
        $this->ideaClassificationService->update($ideaClassification, $request->validated());

        return redirect()->route('idea-classifications.index')
            ->with('success', 'Idea classification updated successfully.');
    }

    public function destroy(IdeaClassification $ideaClassification): RedirectResponse
    {
        $this->ideaClassificationService->delete($ideaClassification);

        return redirect()->route('idea-classifications.index')
            ->with('success', 'Idea classification deleted successfully.');
    }
}
