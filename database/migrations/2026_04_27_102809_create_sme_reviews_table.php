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
        Schema::create('sme_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('idea_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['pending', 'approved', 'rejected', 'revise'])->default('pending');
            $table->text('review_comments')->nullable();
            $table->enum('recommendation', ['approve', 'reject', 'revise'])->nullable();
            $table->integer('rating')->nullable();
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
        Schema::dropIfExists('sme_reviews');
    }
};
