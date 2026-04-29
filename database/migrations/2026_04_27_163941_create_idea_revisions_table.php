<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('idea_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('idea_id')->constrained()->cascadeOnDelete();
            $table->foreignId('changed_by')->constrained('users');
            $table->string('field');          // e.g., 'status', 'team_members'
            $table->longText('old_value')->nullable();
            $table->longText('new_value')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('idea_revisions');
    }
};
