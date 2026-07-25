<?php

namespace App\Http\Controllers;

use App\Models\Idea;
use App\Models\IdeaReview;
use App\Services\Points\PointAwardService;
use Illuminate\Http\Request;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private PointAwardService $pointAwardService,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        $ideas = $user->authoredIdeas()->select('status')->get();

        $data = [
            'pointsBalance' => $this->pointAwardService->getBalance($user),
            'recentTransactions' => $this->pointAwardService->getRecentTransactions($user),
            'userIdeaStats' => [
                'total' => $ideas->count(),
                'drafts' => $ideas->where('status', 'draft')->count(),
                'under_review' => $ideas->whereIn('status', ['submitted', 'assigned', 'revision_requested', 'resubmitted', 'classified'])->count(),
                'approved' => $ideas->where('status', 'approved')->count(),
            ],
            'pendingInvitations' => $user->pendingInvitations()
                ->with(['idea:id,title,slug', 'invitedBy:id,name'])
                ->latest()
                ->take(5)
                ->get(),
        ];

        $canViewReview = $user->can('idea.assign_officer')
            || $user->can('idea.classify')
            || $user->can('idea.record_decision')
            || $user->can('idea.review')
            || $user->can('idea.receive_new_submission_notifications');

        if ($canViewReview) {
            $reviewStats = [];

            if ($user->can('idea.assign_officer')) {
                $reviewStats['pending_assignment_count'] = Idea::where('status', 'submitted')
                    ->whereNull('assigned_officer_id')
                    ->count();

                $data['assignStats'] = [
                    'total_submissions' => Idea::where('status', 'submitted')->count(),
                    'total_assigned' => Idea::whereNotNull('assigned_officer_id')->count(),
                    'your_assignments' => IdeaReview::where('reviewer_id', $user->id)
                        ->where('stage', 'assignment')
                        ->where('action', 'assigned')
                        ->count(),
                    'status_breakdown' => Idea::selectRaw('status, count(*) as count')
                        ->whereIn('status', ['submitted', 'assigned', 'revision_requested', 'resubmitted', 'classified', 'approved', 'rejected'])
                        ->groupBy('status')
                        ->orderBy('status')
                        ->get(),
                ];
            }

            if ($user->can('idea.classify') || $user->can('idea.record_decision')) {
                $hasClassify = $user->can('idea.classify');
                $hasDecide = $user->can('idea.record_decision');

                $reviewStats['my_queue_count'] = Idea::where('assigned_officer_id', $user->id)
                    ->where(function ($q) use ($hasClassify, $hasDecide) {
                        if ($hasClassify && $hasDecide) {
                            $q->whereIn('status', ['assigned', 'resubmitted', 'classified']);
                        } elseif ($hasClassify) {
                            $q->whereIn('status', ['assigned', 'resubmitted']);
                        } elseif ($hasDecide) {
                            $q->whereIn('status', ['classified', 'resubmitted']);
                        }
                    })
                    ->count();
            }

            if ($user->can('idea.record_decision')) {
                $reviewStats['pending_decisions_count'] = Idea::where('assigned_officer_id', $user->id)
                    ->where('status', 'classified')
                    ->whereHas('classification', fn ($q) => $q->where('slug', 'innovation'))
                    ->count();
            }

            $reviewStats['reviewed_count'] = IdeaReview::where('reviewer_id', $user->id)->count();

            $data['reviewStats'] = $reviewStats;
        }

        $data['canViewReview'] = $canViewReview;

        if ($user->can('dashboard.view_admin')) {
            $data['canViewAdmin'] = true;
            $data['allTransactions'] = $this->pointAwardService->getAllTransactions();
            $data['systemStats'] = $this->pointAwardService->getSystemStats();

            if ($user->can('points.create') || $user->can('points.edit') || $user->can('points.delete')) {
                $data['canManagePoints'] = true;
            }

            if ($user->can('user.manage') || $user->can('user.create') || $user->can('user.edit') || $user->can('user.delete')) {
                $data['canManageUsers'] = true;
            }

            if ($user->can('role.manage') || $user->can('role.create') || $user->can('role.edit') || $user->can('role.delete')) {
                $data['canManageRoles'] = true;
            }

            if ($user->can('audit.view')) {
                $data['canViewAudit'] = true;
            }
        }

        $validTabs = ['personal'];
        if ($canViewReview) {
            $validTabs[] = 'review';
        }
        if ($user->can('dashboard.view_admin')) {
            $validTabs[] = 'admin';
        }

        $activeTab = $request->query('tab', 'personal');
        if (! in_array($activeTab, $validTabs, true)) {
            $activeTab = 'personal';
        }

        $data['activeTab'] = $activeTab;

        return inertia('dashboard', $data);
    }
}
