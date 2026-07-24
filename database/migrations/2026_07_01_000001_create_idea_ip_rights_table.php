<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('idea_ip_rights', function (Blueprint $table) {
            $table->id();
            $table->foreignId('idea_id')->constrained()->cascadeOnDelete()->unique();
            $table->boolean('has_ip_protection');
            $table->string('patent_number')->nullable();
            $table->boolean('consent_given')->default(false);
            $table->timestamp('consent_given_at')->nullable();
            $table->string('status')->default('pending');
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('idea_ip_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('idea_ip_right_id')->constrained('idea_ip_rights')->cascadeOnDelete();
            $table->string('file_path');
            $table->string('original_name');
            $table->integer('file_size')->nullable();
            $table->string('mime_type')->nullable();
            $table->softDeletes();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('idea_ip_documents');
        Schema::dropIfExists('idea_ip_rights');
    }
};
