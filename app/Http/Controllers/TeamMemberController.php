<?php

namespace App\Http\Controllers;

use App\Models\TeamMember;
use App\Models\TeamMemberInvitation;
use Illuminate\Http\RedirectResponse;

class TeamMemberController extends Controller
{
    // existing methods...

    public function accept(TeamMemberInvitation $invitation): RedirectResponse
    {
        if ($invitation->used_at || $invitation->expires_at->isPast()) {
            return redirect()->route('idea.index')->with('error', 'This invitation is expired or already used.');
        }

        // Check if user already has an account
        $user = auth()->user() ?? User::where('email', $invitation->invitee_email)
            ->orWhere('work_email', $invitation->invitee_email)
            ->first();

        if (! $user) {
            return redirect()->route('login')->with('status', 'Please log in to accept the invitation.');
        }

        // If user is not the invitee, deny
        if ($user->email !== $invitation->invitee_email && $user->work_email !== $invitation->invitee_email) {
            return redirect()->route('idea.index')->with('error', 'You are not the invited user.');
        }

        // If user is already a team member, mark accepted
        $teamMember = TeamMember::where('idea_id', $invitation->idea_id)
            ->where('email', $invitation->invitee_email)
            ->first();

        if (! $teamMember) {
            $teamMember = TeamMember::create([
                'idea_id' => $invitation->idea_id,
                'user_id' => $user->id,
                'name' => $invitation->invitee_name,
                'email' => $invitation->invitee_email,
                'role' => $invitation->role,
                'permissions' => $invitation->permission,
                'invitation_id' => $invitation->id,
            ]);
        }

        // Mark as used
        $invitation->update(['used_at' => now()]);

        return redirect()->route('idea.show', $invitation->idea)
            ->with('success', 'Invitation accepted!');
    }
}
