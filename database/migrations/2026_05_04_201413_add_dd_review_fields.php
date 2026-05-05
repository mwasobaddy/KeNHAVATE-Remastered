<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dd_reviews', function (Blueprint $table) {
            $table->boolean('is_unlocked')->default(false)->after('status');
            $table->dateTime('review_deadline')->nullable()->after('is_unlocked');
            $table->text('feedback')->nullable()->after('budget_implications');
            $table->dateTime('feedback_sent_at')->nullable()->after('feedback');
        });
    }

    public function down(): void
    {
        Schema::table('dd_reviews', function (Blueprint $table) {
            $table->dropColumn(['is_unlocked', 'review_deadline', 'feedback', 'feedback_sent_at']);
        });
    }
};
