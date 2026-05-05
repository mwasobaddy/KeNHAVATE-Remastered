<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ideas', function (Blueprint $table) {
            $table->id();
            $table->string('idea_title', 255);
            $table->string('slug')->unique();
            $table->foreignId('thematic_area_id')->constrained()->cascadeOnDelete();
            $table->text('abstract')->nullable();
            $table->text('problem_statement')->nullable();
            $table->text('proposed_solution')->nullable();
            $table->text('cost_benefit_analysis')->nullable();
            $table->text('declaration_of_interests')->nullable();
            $table->boolean('original_idea_disclaimer')->default(false);
            $table->boolean('collaboration_enabled')->default(false);
            $table->boolean('team_effort')->default(false);
            $table->boolean('comments_enabled')->default(true);

            // Collaboration and revision tracking fields
            $table->unsignedInteger('current_revision_number')->default(1);
            $table->date('collaboration_deadline')->nullable();

            // Attachment path (binary columns were removed in 2026_04_27_163940)
            $table->string('attachment_path')->nullable();

            // Stage and Status (added in 2026_05_05_114620)
            $table->foreignId('stage_id')->nullable()->constrained('idea_stages')->onDelete('set null');
            $table->foreignId('status_id')->nullable()->constrained('idea_statuses')->onDelete('set null');

            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index(['collaboration_enabled']);
            $table->index(['collaboration_deadline']);
            $table->index(['thematic_area_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ideas');
    }
};
