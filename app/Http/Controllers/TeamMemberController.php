<?php

namespace App\Http\Controllers;

use App\Models\Idea;
use App\Models\TeamMember;
use App\Models\TeamMemberInvitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeamMemberController extends Controller
{
    public function index(Idea $idea): Response
    {
        abort_unless($idea->user_id === auth()->id(), 403);

        $members = $idea->teamMembers()->paginate(20);

        return Inertia::render('idea/team-members/index', [
            'idea' => $idea,
            'members' => $members,
        ]);
    }

    public function create(Idea $idea): Response
    {
        abort_unless($idea->user_id === auth()->id(), 403);

        return Inertia::render('idea/team-members/create', [
            'idea' => $idea,
        ]);
    }

    public function store(Request $request, Idea $idea): RedirectResponse
    {
        abort_unless($idea->user_id === auth()->id(), 403);

        $request->validate([
            'email' => 'required|email',
            'name' => 'required|string',
            'role' => 'nullable|string',
            'permissions' => 'required|in:view,edit',
        ]);

        TeamMember::create([
            'idea_id' => $idea->id,
            'user_id' => null,
            'email' => $request->email,
            'name' => $request->name,
            'role' => $request->role ?? 'Collaborator',
            'permissions' => $request->permissions,
        ]);

        return redirect()->route('idea.teamMembers.index', $idea)->with('success', 'Team member added.');
    }

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
