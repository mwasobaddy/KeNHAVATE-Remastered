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
        Schema::table('team_members', function (Blueprint $table) {
            // Drop json permissions column if it exists
            if (Schema::hasColumn('team_members', 'permissions')) {
                $table->dropColumn('permissions');
            }
            // Add enum permissions column
            $table->enum('permissions', ['view', 'edit'])->nullable()->after('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('team_members', function (Blueprint $table) {
            $table->dropColumn('permissions');
            $table->json('permissions')->nullable()->comment('JSON array of permissions: view, edit, delete, etc.')->after('role');
        });
    }
};
