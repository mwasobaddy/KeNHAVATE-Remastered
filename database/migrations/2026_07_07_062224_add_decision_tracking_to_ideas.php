<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ideas', function (Blueprint $table) {
            $table->timestamp('decided_at')->nullable()->after('classified_at');
            $table->foreignId('decided_by_id')
                ->nullable()
                ->after('decided_at')
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('budget_logged_at')->nullable()->after('decided_by_id');
            $table->timestamp('completed_at')->nullable()->after('budget_logged_at');
        });
    }

    public function down(): void
    {
        Schema::table('ideas', function (Blueprint $table) {
            $table->dropColumn(['decided_at', 'decided_by_id', 'budget_logged_at', 'completed_at']);
        });
    }
};
