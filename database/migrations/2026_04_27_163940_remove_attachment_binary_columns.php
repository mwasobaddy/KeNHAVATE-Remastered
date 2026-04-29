<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (Schema::hasColumn('ideas', 'attachment')) {
            Schema::table('ideas', function (Blueprint $table) {
                $table->dropColumn('attachment');
            });
        }
        if (Schema::hasColumn('ideas', 'attachment_filename')) {
            Schema::table('ideas', function (Blueprint $table) {
                $table->dropColumn('attachment_filename');
            });
        }
        if (Schema::hasColumn('ideas', 'attachment_mime')) {
            Schema::table('ideas', function (Blueprint $table) {
                $table->dropColumn('attachment_mime');
            });
        }
        if (Schema::hasColumn('ideas', 'attachment_size')) {
            Schema::table('ideas', function (Blueprint $table) {
                $table->dropColumn('attachment_size');
            });
        }
    }

    public function down()
    {
        Schema::table('ideas', function (Blueprint $table) {
            $table->binary('attachment')->nullable();
            $table->string('attachment_filename')->nullable();
            $table->string('attachment_mime')->nullable();
            $table->unsignedBigInteger('attachment_size')->nullable();
        });
    }
};
