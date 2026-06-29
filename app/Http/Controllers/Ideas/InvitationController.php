<?php

namespace App\Http\Controllers\Ideas;

use App\Http\Controllers\Controller;
use App\Services\Ideas\InvitationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class InvitationController extends Controller
{
    public function __construct(
        private InvitationService $invitationService,
    ) {}

    public function show(string $token): Response|RedirectResponse
    {
        try {
            $invitation = $this->invitationService->findByToken($token);
        } catch (\Throwable) {
            abort(404);
        }

        if (auth()->check()) {
            $accepted = $this->invitationService->accept($invitation, auth()->user());

            return $accepted
                ? redirect()->route('ideas.show', $invitation->idea->slug)
                : redirect()->route('dashboard');
        }

        session(['invitation_token' => $invitation->token]);

        return inertia('ideas/invitation', [
            'invitation' => [
                'idea_title' => $invitation->idea->title,
                'invited_by' => $invitation->invitedBy->name,
                'token' => $invitation->token,
            ],
        ]);
    }

    public function acceptFromLogin(Request $request): RedirectResponse
    {
        $token = $request->session()->pull('invitation_token');

        if (! $token) {
            return redirect()->route('dashboard');
        }

        try {
            $invitation = $this->invitationService->findByToken($token);
        } catch (\Throwable) {
            return redirect()->route('dashboard');
        }

        $accepted = $this->invitationService->accept($invitation, $request->user());

        return $accepted
            ? redirect()->route('ideas.show', $invitation->idea->slug)
            : redirect()->route('dashboard');
    }
}
