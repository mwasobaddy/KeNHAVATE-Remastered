<?php

namespace App\Http\Controllers\Support;

use App\Http\Controllers\Controller;
use App\Http\Requests\Support\ReviewBugReportRequest;
use App\Models\BugReport;
use App\Services\Support\BugReportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class BugReportManagementController extends Controller
{
    public function __construct(
        private BugReportService $bugReportService,
    ) {}

    public function index(Request $request): Response
    {
        $validTabs = ['pending', 'reviewed'];
        $activeTab = $request->query('tab', 'pending');

        if (! in_array($activeTab, $validTabs, true)) {
            $activeTab = 'pending';
        }

        $query = BugReport::with(['user:id,name', 'reviewer:id,name', 'attachments'])->latest();

        if ($activeTab === 'pending') {
            $query->where('status', 'pending');
        } else {
            $query->where('status', '!=', 'pending');

            if ($search = $request->get('search')) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($q) => $q->where('name', 'like', "%{$search}%"));
                });
            }

            if ($statusFilter = $request->get('status')) {
                $query->whereIn('status', explode(',', $statusFilter));
            }

            if ($dateFrom = $request->get('date_from')) {
                $query->whereDate('created_at', '>=', $dateFrom);
            }

            if ($dateTo = $request->get('date_to')) {
                $query->whereDate('created_at', '<=', $dateTo);
            }
        }

        return inertia('bug-reports/manage', [
            'reports' => $query->paginate(20),
            'activeTab' => $activeTab,
        ]);
    }

    public function review(ReviewBugReportRequest $request, BugReport $bugReport): RedirectResponse
    {
        if ($bugReport->status !== 'pending') {
            return back()->with('error', 'This report has already been reviewed.');
        }

        $action = $request->input('action');

        if ($action === 'accept') {
            $this->bugReportService->acceptReport(
                $bugReport,
                $request->user(),
                $request->input('notes'),
            );

            return to_route('bug-reports.manage')
                ->with('success', 'Bug report accepted and bounty awarded.');
        }

        $this->bugReportService->rejectReport(
            $bugReport,
            $request->user(),
            $request->input('notes', 'No reason provided.'),
        );

        return to_route('bug-reports.manage')
            ->with('success', 'Bug report rejected.');
    }
}
