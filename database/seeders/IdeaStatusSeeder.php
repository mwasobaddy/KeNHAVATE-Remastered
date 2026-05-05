<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class IdeaStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $smeStageId = DB::table('idea_stages')->where('name', 'SME')->value('id');
        $boardStageId = DB::table('idea_stages')->where('name', 'BOARD')->value('id');

        $statuses = [
            // Draft (no stage - before submission)
            [
                'name' => 'DRAFT',
                'description' => 'Initial draft before submission',
                'stage_id' => null,
            ],
            // Submitted (no stage - awaiting DD unlock)
            [
                'name' => 'SUBMITTED',
                'description' => 'Idea submitted; awaiting DD action to open it for review',
                'stage_id' => null,
            ],
            [
                'name' => 'OPEN_FOR_SME_REVIEW',
                'description' => 'DD has unlocked the idea; SME comment period is active',
                'stage_id' => $smeStageId,
            ],
            [
                'name' => 'SME_REVIEW_IN_PROGRESS',
                'description' => 'One or more SMEs have submitted comments',
                'stage_id' => $smeStageId,
            ],
            [
                'name' => 'PENDING_DD_COMPILATION_SME',
                'description' => 'Review deadline expired; DD compiling SME comments',
                'stage_id' => $smeStageId,
            ],
            [
                'name' => 'REVISION_REQUIRED_SME',
                'description' => 'Idea needs correction after SME review',
                'stage_id' => $smeStageId,
            ],
            [
                'name' => 'UNDER_REVISION',
                'description' => 'Author is actively working on corrections',
                'stage_id' => $smeStageId,
            ],
            [
                'name' => 'REVISION_SUBMITTED',
                'description' => 'Corrected idea resubmitted; awaiting verification',
                'stage_id' => $smeStageId,
            ],
            [
                'name' => 'DELEGATED_SME_REVIEW',
                'description' => 'DD assigned one SME to verify corrections were applied',
                'stage_id' => $smeStageId,
            ],
            [
                'name' => 'PENDING_DD_DECISION',
                'description' => 'Delegated SME has reviewed; awaiting DD final call',
                'stage_id' => $smeStageId,
            ],
            // Board Stage
            [
                'name' => 'PENDING_BOARD_REVIEW',
                'description' => 'SME stage cleared; awaiting board scheduling',
                'stage_id' => $boardStageId,
            ],
            [
                'name' => 'BOARD_REVIEW_IN_PROGRESS',
                'description' => 'Board members actively reviewing the idea',
                'stage_id' => $boardStageId,
            ],
            [
                'name' => 'PENDING_DD_COMPILATION_BOARD',
                'description' => 'Review deadline expired; DD compiling board comments',
                'stage_id' => $boardStageId,
            ],
            [
                'name' => 'BOARD_REVISION_REQUIRED',
                'description' => 'Board requests corrections or additional information',
                'stage_id' => $boardStageId,
            ],
            [
                'name' => 'UNDER_BOARD_REVISION',
                'description' => 'Author addressing board-requested corrections',
                'stage_id' => $boardStageId,
            ],
            [
                'name' => 'BOARD_REVISION_SUBMITTED',
                'description' => 'Author resubmitted after board feedback',
                'stage_id' => $boardStageId,
            ],
            // Terminal - Rejection
            [
                'name' => 'REJECTED',
                'description' => 'Final rejection - idea does not meet required standards',
                'stage_id' => $boardStageId,
            ],
            // Terminal - Approval
            [
                'name' => 'BOARD_APPROVED',
                'description' => 'Board has approved the idea',
                'stage_id' => $boardStageId,
            ],
            [
                'name' => 'IMPLEMENTATION_IN_PROGRESS',
                'description' => 'Approved idea is being implemented',
                'stage_id' => $boardStageId,
            ],
            [
                'name' => 'CLOSED',
                'description' => 'Implementation complete; idea record archived',
                'stage_id' => $boardStageId,
            ],
        ];

        foreach ($statuses as $status) {
            DB::table('idea_statuses')->insert([
                'name' => $status['name'],
                'description' => $status['description'],
                'stage_id' => $status['stage_id'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
