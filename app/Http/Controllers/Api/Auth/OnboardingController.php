<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\OnboardingRequest;
use App\Services\OnboardingService;
use Illuminate\Http\JsonResponse;

class OnboardingController extends Controller
{
    public function __construct(
        private OnboardingService $onboardingService,
    ) {}

    public function show(): JsonResponse
    {
        return response()->json(
            $this->onboardingService->getFormData(auth()->user()),
        );
    }

    public function store(OnboardingRequest $request): JsonResponse
    {
        $this->onboardingService->complete(
            $request->user(),
            $request->validated(),
        );

        return response()->json([
            'message' => 'Onboarding completed successfully.',
        ]);
    }
}
