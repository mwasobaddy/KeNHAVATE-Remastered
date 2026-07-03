<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ideas', function (Blueprint $table) {
            $table->foreignId('assigned_officer_id')
                ->nullable()
                ->after('author_id')
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('assigned_at')
                ->nullable()
                ->after('assigned_officer_id');

            $table->foreignId('classification_id')
                ->nullable()
                ->after('assigned_at')
                ->constrained('idea_classifications')
                ->nullOnDelete();

            $table->timestamp('classified_at')
                ->nullable()
                ->after('classification_id');
        });
    }

    public function down(): void
    {
        Schema::table('ideas', function (Blueprint $table) {
            $table->dropConstrainedForeignId('assigned_officer_id');
            $table->dropColumn('assigned_at');
            $table->dropConstrainedForeignId('classification_id');
            $table->dropColumn('classified_at');
        });
    }
};
