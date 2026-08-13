<?php

namespace App\Services\Ideas;

use App\Mail\IdeaClassifiedMail;
use App\Models\Idea;
use App\Models\IdeaClassification;
use App\Models\IdeaReview;
use App\Models\User;
use App\Services\AuditService;
use App\Services\Support\SendsMailSafely;
use Illuminate\Support\Facades\Mail;

class ClassificationService
{
    use SendsMailSafely;

    public function __construct(
        private AuditService $auditService,
    ) {}

    public function classify(Idea $idea, User $officer, IdeaClassification $classification, ?array $data): Idea
    {
        $updateData = [
            'classification_id' => $classification->id,
            'classified_at' => now(),
            'status' => 'classified',
        ];

        if (isset($data['category_id'])) {
            $updateData['category_id'] = $data['category_id'];
        }

        $idea->update($updateData);

        IdeaReview::create([
            'idea_id' => $idea->id,
            'reviewer_id' => $officer->id,
            'stage' => 'classification',
            'action' => 'classified',
            'notes' => $data['notes'] ?? null,
            'document_path' => null,
        ]);

        $this->sendMailSafely('idea_classified', fn () => Mail::to($idea->author)->send(new IdeaClassifiedMail($idea, $classification)));

        $this->auditService->log(
            $officer,
            'idea_classified',
            "Classified idea '{$idea->title}' as {$classification->name}",
        );

        return $idea->fresh();
    }
}
