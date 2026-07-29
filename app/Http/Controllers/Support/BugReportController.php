<?php

namespace App\Http\Controllers\Support;

use App\Http\Controllers\Controller;
use App\Http\Requests\Support\StoreBugReportRequest;
use App\Models\BugReport;
use App\Services\Support\BugReportService;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;

class BugReportController extends Controller
{
    public function __construct(
        private BugReportService $bugReportService,
    ) {}

    public function create(): Response
    {
        return inertia('bug-reports/create');
    }

    public function store(StoreBugReportRequest $request): RedirectResponse
    {
        $this->bugReportService->createReport(
            $request->user(),
            $request->only('title', 'description'),
            $request->file('attachments', []),
        );

        return to_route('bug-reports.index')
            ->with('success', 'Bug report submitted successfully.');
    }

    public function index(): Response
    {
        $reports = BugReport::with('attachments')
            ->where('user_id', auth()->id())
            ->latest()
            ->paginate(15);

        return inertia('bug-reports/index', [
            'reports' => $reports,
        ]);
    }
}
