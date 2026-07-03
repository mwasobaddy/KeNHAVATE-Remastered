<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ideas', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->foreignId('category_id')->constrained('idea_categories');
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('assigned_officer_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('assigned_at')->nullable();
            $table->foreignId('classification_id')
                ->nullable()
                ->constrained('idea_classifications')
                ->nullOnDelete();
            $table->timestamp('classified_at')->nullable();
            $table->text('problem_statement');
            $table->text('proposed_solution');
            $table->text('cost_benefit_analysis');
            $table->boolean('collaboration_enabled')->default(true);
            $table->string('status')->default('draft');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ideas');
    }
};
