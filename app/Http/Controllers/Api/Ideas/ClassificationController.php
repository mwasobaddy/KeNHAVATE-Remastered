<?php

namespace App\Http\Controllers\Api\Ideas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ideas\ClassifyIdeaRequest;
use App\Models\IdeaClassification;
use App\Services\Ideas\ClassificationService;
use App\Services\Ideas\IdeaService;
use Illuminate\Http\JsonResponse;

class ClassificationController extends Controller
{
    public function __construct(
        private IdeaService $ideaService,
        private ClassificationService $classificationService,
    ) {}

    public function store(ClassifyIdeaRequest $request, string $slug): JsonResponse
    {
        $idea = $this->ideaService->findBySlug($slug);

        if (! $idea) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        if ($idea->classification_id !== null) {
            return response()->json(['message' => 'This idea has already been classified.'], 409);
        }

        $classification = IdeaClassification::findOrFail($request->classification_id);

        $this->classificationService->classify(
            $idea,
            $request->user(),
            $classification,
            $request->safe()->only(['category_id', 'notes']),
        );

        return response()->json(
            $idea->fresh()->load(['author', 'category', 'classification', 'assignedOfficer']),
        );
    }
}
