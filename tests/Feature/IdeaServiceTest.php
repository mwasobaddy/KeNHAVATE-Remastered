<?php

use App\Models\Idea;
use App\Models\ThematicArea;
use App\Models\User;
use App\Services\IdeaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('idea service stores attachment_path and does not persist stale path column', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $thematicArea = ThematicArea::create([
        'name' => 'Test Area',
        'slug' => 'test-area',
        'description' => 'Test area description',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $data = [
        'idea_title' => 'Test Idea',
        'abstract' => 'Abstract content',
        'problem_statement' => 'Problem statement content',
        'proposed_solution' => 'Proposed solution content',
        'cost_benefit_analysis' => 'Cost benefit analysis content',
        'declaration_of_interests' => 'Declaration of interests',
        'original_idea_disclaimer' => true,
        'collaboration_enabled' => false,
        'team_effort' => false,
        'comments_enabled' => true,
        'current_revision_number' => 1,
        'status' => 'draft',
        'thematic_area_id' => $thematicArea->id,
        'attachment' => UploadedFile::fake()->create('idea.pdf', 100, 'application/pdf'),
    ];

    $service = new IdeaService;
    $idea = $service->create($data, $user->id);

    expect($idea)->toBeInstanceOf(Idea::class);
    expect($idea->attachment_path)->toBeString();
    expect($idea->attachment_path)->not->toBeEmpty();
    expect(array_key_exists('path', $idea->getAttributes()))->toBeFalse();
    Storage::disk('public')->assertExists($idea->attachment_path);
});
