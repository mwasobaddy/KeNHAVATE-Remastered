<?php

namespace App\Http\Controllers\Ideas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ideas\ClassifyIdeaRequest;
use App\Models\IdeaClassification;
use App\Services\Ideas\ClassificationService;
use App\Services\Ideas\IdeaService;
use Illuminate\Http\RedirectResponse;

class ClassificationController extends Controller
{
    public function __construct(
        private IdeaService $ideaService,
        private ClassificationService $classificationService,
    ) {}

    public function store(ClassifyIdeaRequest $request, string $slug): RedirectResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            abort(404);
        }

        if ($idea->classification_id !== null) {
            return redirect()->route('ideas.show', $idea->slug)
                ->with('error', 'This idea has already been classified.');
        }

        $classification = IdeaClassification::findOrFail($request->classification_id);

        $this->classificationService->classify(
            $idea,
            $request->user(),
            $classification,
            $request->safe()->only(['category_id', 'notes']),
        );

        return redirect()->route('ideas.show', $idea->slug)
            ->with('success', "Idea classified as {$classification->name}.");
    }
}
