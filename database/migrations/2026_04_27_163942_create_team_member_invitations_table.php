<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('team_member_invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('idea_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // Inviter
            $table->string('invitee_name');
            $table->string('invitee_email');
            $table->string('role');
            $table->enum('permission', ['view', 'edit']);
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('used_at')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('team_member_invitations');
    }
};
