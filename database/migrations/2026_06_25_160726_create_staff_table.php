<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('region_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('directorate_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->string('designation')->nullable();
            $table->foreignId('contract_type_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};
