<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Idea;
use App\Models\Like;
use App\Models\Comment;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class IdeaDataSeeder extends Seeder
{
    public function run()
    {
        // Clear existing ideas, likes, comments to avoid conflicts
        DB::table('likes')->truncate();
        DB::table('comments')->truncate();
        DB::table('ideas')->truncate();

        // Get all users
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->warn('No users found. Please run UserSeeder first.');
            return;
        }

        // For each user, create random ideas with likes and comments
        foreach ($users as $user) {
            $numIdeas = rand(1, 5); // Random number of ideas per user (1-5)
            
            for ($i = 0; $i < $numIdeas; $i++) {
                $idea = Idea::create([
                    'idea_title' => $this->generateTitle(),
                    'slug' => Idea::generateUniqueSlug($this->generateTitle()),
                    'thematic_area_id' => $this->getThematicAreaId(),
                    'abstract' => $this->generateAbstract(),
                    'problem_statement' => $this->generateProblemStatement(),
                    'proposed_solution' => $this->generateProposedSolution(),
                    'cost_benefit_analysis' => $this->generateCostBenefitAnalysis(),
                    'declaration_of_interests' => $this->generateDeclaration(),
                    'original_idea_disclaimer' => $this->generateDisclaimer(),
                    'collaboration_enabled' => $this->generateCollaborationEnabled(),
                    'team_effort' => $this->generateTeamEffort(),
                    'comments_enabled' => $this->generateCommentsEnabled(),
                    'current_revision_number' => rand(1, 10),
                    'collaboration_deadline' => $this->generateDeadline(),
                    'status' => $this->generateStatus(),
                    'user_id' => $user->id,
                    'attachment_path' => $this->generateAttachmentPath(),
                ]);

                // Generate random likes (0-8)
                $numLikes = rand(0, 8);
                $likers = $users->shuffle()->take($numLikes);
                foreach ($likers as $liker) {
                    Like::create([
                        'likeable_type' => Idea::class,
                        'likeable_id' => $idea->id,
                        'user_id' => $liker->id,
                    ]);
                }

                // Generate random comments (0-8)
                $numComments = rand(0, 8);
                $commenters = $users->shuffle()->take($numComments);
                foreach ($commenters as $commenter) {
                    Comment::create([
                        'idea_id' => $idea->id,
                        'user_id' => $commenter->id,
                        'content' => $this->generateCommentContent(),
                    ]);
                }
            }
        }
    }

    private function generateTitle()
    {
        return 'Innovative Idea ' . rand(100, 999);
    }

    private function generateAbstract()
    {
        return 'This is a sample abstract for the idea.';
    }

    private function generateProblemStatement()
    {
        return 'A real-world problem that needs solving.';
    }

    private function generateProposedSolution()
    {
        return 'A creative solution to address the problem.';
    }

    private function generateCostBenefitAnalysis()
    {
        return 'Analysis of costs versus benefits.';
    }

    private function generateDeclaration()
    {
        return 'Declaration of interests statement.';
    }

    private function generateDisclaimer()
    {
        return 'Original idea disclaimer text.';
    }

    private function generateCollaborationEnabled()
    {
        return rand(0, 1) === 1;
    }

    private function generateTeamEffort()
    {
        return rand(0, 1) === 1;
    }

    private function generateCommentsEnabled()
    {
        return rand(0, 1) === 1;
    }

    private function generateDeadline()
    {
        return Carbon::now()->addWeeks(rand(1, 4))->toDateString();
    }

    private function generateStatus()
    {
        $statuses = ['draft', 'stage 1 review', 'stage 2 review', 'stage 1 revise', 'stage 2 revise', 'approved', 'rejected'];
        return $statuses[rand(0, 6)];
    }

    private function generateAttachmentPath()
    {
        return 'attachments/' . Str::uuid() . '.pdf';
    }

    private function getThematicAreaId()
    {
        return rand(1, 5); // Assuming 5 thematic areas exist
    }

    private function getRandomUserId($users)
    {
        return $users[array_rand($users->toArray())]->id;
    }

    private function generateCommentContent()
    {
        $comments = [
            'Great idea!',
            'This needs more details.',
            'I love this concept.',
            'Have you considered the implementation challenges?',
            'This could really make a difference.',
            'Interesting approach.',
            'I would like to collaborate on this.',
            'Need to see more data on this.',
            'Well thought out.',
            'This aligns with our strategic goals.'
        ];
        return $comments[array_rand($comments)];
    }
}