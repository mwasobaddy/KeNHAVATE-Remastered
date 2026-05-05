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
        Schema::create('dd_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('idea_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['pending', 'approved', 'rejected', 'revise'])->default('pending');

            // Added in 2026_05_04_201413
            $table->boolean('is_unlocked')->default(false);
            $table->dateTime('review_deadline')->nullable();

            $table->text('review_comments')->nullable();
            $table->enum('decision', ['approve', 'reject'])->nullable();
            $table->text('implementation_timeline')->nullable();
            $table->text('budget_implications')->nullable();

            // Added in 2026_05_04_201413
            $table->text('feedback')->nullable();
            $table->dateTime('feedback_sent_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['idea_id', 'status']);
            $table->index(['reviewer_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dd_reviews');
    }
};
