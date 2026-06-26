<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;

class TermsController extends Controller
{
    public function __construct(
        private AuditService $auditService,
    ) {}

    public function show(): JsonResponse
    {
        $user = auth()->user();

        return response()->json([
            'accepted' => (bool) $user->terms_accepted,
            'title' => config('terms.title'),
            'text' => config('terms.text'),
        ]);
    }

    public function store(): JsonResponse
    {
        $user = auth()->user();
        $user->forceFill(['terms_accepted' => true])->save();

        $this->auditService->log($user, 'terms_accepted', 'Accepted terms and conditions');

        return response()->json([
            'message' => 'Terms and conditions accepted.',
        ]);
    }
}
