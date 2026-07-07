<?php

namespace App\Console\Commands;

use App\Models\Idea;
use App\Models\IdeaReview;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('ideas:close-budget-logged')]
#[Description('Close ideas logged for budget consideration after 2 fiscal years with no allocation')]
class CloseBudgetLoggedIdeas extends Command
{
    public function handle(): void
    {
        $cutoff = now()->subYears(2);

        $closed = 0;

        Idea::where('status', 'budget_logged')
            ->where('budget_logged_at', '<=', $cutoff)
            ->chunk(100, function ($ideas) use (&$closed) {
                foreach ($ideas as $idea) {
                    $idea->update(['status' => 'closed']);

                    IdeaReview::create([
                        'idea_id' => $idea->id,
                        'reviewer_id' => null,
                        'stage' => 'decision',
                        'action' => 'closed',
                        'notes' => 'Automatically closed after 2 budget cycles with no allocation.',
                    ]);

                    $closed++;
                }
            });

        $this->components->info("Closed {$closed} idea(s) after 2 budget cycles.");
    }
}
