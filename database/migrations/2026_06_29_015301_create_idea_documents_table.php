<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('idea_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('idea_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // 'proposal' or 'supporting'
            $table->string('file_path');
            $table->string('original_name');
            $table->integer('file_size')->nullable();
            $table->string('mime_type')->nullable();
            $table->softDeletes();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['idea_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('idea_documents');
    }
};
