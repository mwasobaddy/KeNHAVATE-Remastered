<?php

namespace App\Http\Controllers\Api\Ideas;

use App\Http\Controllers\Controller;
use App\Services\Ideas\InvitationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvitationController extends Controller
{
    public function __construct(
        private InvitationService $invitationService,
    ) {}

    public function show(string $token): JsonResponse
    {
        try {
            $invitation = $this->invitationService->findByToken($token);
        } catch (\Throwable) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        return response()->json([
            'idea_title' => $invitation->idea->title,
            'invited_by' => $invitation->invitedBy->name,
        ]);
    }

    public function accept(Request $request, string $token): JsonResponse
    {
        try {
            $invitation = $this->invitationService->findByToken($token);
        } catch (\Throwable) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $accepted = $this->invitationService->accept($invitation, $request->user());

        if (! $accepted) {
            return response()->json(['message' => 'This invitation is not for your account.'], 403);
        }

        return response()->json([
            'message' => 'Invitation accepted.',
            'idea_slug' => $invitation->idea->slug,
        ]);
    }
}
