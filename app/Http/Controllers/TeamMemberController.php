<?php

namespace App\Http\Controllers;

use App\Http\Requests\TeamMember\StoreTeamMemberRequest;
use App\Http\Requests\TeamMember\UpdateTeamMemberRequest;
use App\Models\Idea;
use App\Models\TeamMember;
use App\Services\TeamMemberService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TeamMemberController extends Controller
{
    public function __construct(
        private TeamMemberService $teamMemberService
    ) {}

    public function index(Idea $idea): Response
    {
        $members = $this->teamMemberService->getForIdea($idea->id);

        return Inertia::render('idea/team-members/index', [
            'idea' => $idea->load('user'),
            'members' => $members,
        ]);
    }

    public function create(Idea $idea): Response
    {
        return Inertia::render('idea/team-members/create', [
            'idea' => $idea,
        ]);
    }

    public function store(StoreTeamMemberRequest $request): RedirectResponse
    {
        try {
            $this->teamMemberService->create($request->validated());

            return back()->with('success', 'Team member added successfully!');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to add team member.']);
        }
    }

    public function show(TeamMember $teamMember): Response
    {
        return Inertia::render('idea/team-members/show', [
            'member' => $teamMember->load('idea', 'user'),
        ]);
    }

    public function edit(TeamMember $teamMember): Response
    {
        return Inertia::render('idea/team-members/edit', [
            'member' => $teamMember->load('idea'),
        ]);
    }

    public function update(UpdateTeamMemberRequest $request, TeamMember $teamMember): RedirectResponse
    {
        try {
            $this->teamMemberService->update($teamMember, $request->validated());

            return back()->with('success', 'Team member updated successfully!');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update team member.']);
        }
    }

    public function destroy(TeamMember $teamMember): RedirectResponse
    {
        try {
            $this->teamMemberService->delete($teamMember);

            return back()->with('success', 'Team member removed successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to remove team member.']);
        }
    }
}
