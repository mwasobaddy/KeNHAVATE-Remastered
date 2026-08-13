<?php

namespace App\Services\Support;

use App\Mail\Support\BugReportAcceptedMail;
use App\Mail\Support\BugReportRejectedMail;
use App\Mail\Support\BugReportSubmittedMail;
use App\Models\BugReport;
use App\Models\Point;
use App\Models\User;
use App\Services\AuditService;
use App\Services\Points\PointAwardService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class BugReportService
{
    use SendsMailSafely;

    public function __construct(
        private AuditService $auditService,
        private PointAwardService $pointAwardService,
    ) {}

    public function createReport(User $user, array $data, array $files = []): BugReport
    {
        return DB::transaction(function () use ($user, $data, $files) {
            $report = BugReport::create([
                'user_id' => $user->id,
                'title' => $data['title'],
                'description' => $data['description'],
                'status' => 'pending',
            ]);

            foreach ($files as $file) {
                $path = $file->store('bug-reports', 'public');

                $report->attachments()->create([
                    'file_path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ]);
            }

            $this->auditService->log(
                $user,
                'bug_report_created',
                "Submitted bug report: {$data['title']}",
            );

            $this->notifyManagers($report, $user);

            return $report;
        });
    }

    public function acceptReport(BugReport $report, User $reviewer, ?string $notes = null): void
    {
        DB::transaction(function () use ($report, $reviewer, $notes) {
            $report->update([
                'status' => 'accepted',
                'reviewer_id' => $reviewer->id,
                'reviewer_notes' => $notes,
                'reviewed_at' => now(),
            ]);

            $bounty = Point::where('name', 'Bug Bounty')->first();

            if ($bounty) {
                $this->pointAwardService->award($report->user, $bounty);
            }

            $this->auditService->log(
                $reviewer,
                'bug_report_accepted',
                "Accepted bug report #{$report->id}: {$report->title}",
            );

            $this->sendMailSafely('bug_report_accepted', fn () => Mail::to($report->user)->send(new BugReportAcceptedMail($report, $notes)));
        });
    }

    public function rejectReport(BugReport $report, User $reviewer, string $reason): void
    {
        DB::transaction(function () use ($report, $reviewer, $reason) {
            $report->update([
                'status' => 'rejected',
                'reviewer_id' => $reviewer->id,
                'reviewer_notes' => $reason,
                'reviewed_at' => now(),
            ]);

            $this->auditService->log(
                $reviewer,
                'bug_report_rejected',
                "Rejected bug report #{$report->id}: {$report->title} — {$reason}",
            );

            $this->sendMailSafely('bug_report_rejected', fn () => Mail::to($report->user)->send(new BugReportRejectedMail($report, $reason)));
        });
    }

    private function notifyManagers(BugReport $report, User $reporter): void
    {
        $managers = User::permission('report.receive_report_notification')->get();

        foreach ($managers as $manager) {
            $this->sendMailSafely("bug_report_submitted_to_{$manager->email}", fn () => Mail::to($manager)->send(new BugReportSubmittedMail($report, $reporter)));
        }
    }
}
