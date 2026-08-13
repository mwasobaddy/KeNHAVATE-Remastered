<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add foreign keys that reference tables created in later migrations.
     *
     * SQLite does not enforce foreign keys by default, so the constraints are
     * only restored on database drivers where they are enforced (MySQL).
     */
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('ideas', function (Blueprint $table) {
            if (! $this->hasForeignKey('ideas', 'ideas_category_id_foreign')) {
                $table->index('category_id');
                $table->foreign('category_id')->references('id')->on('idea_categories');
            }

            if (! $this->hasForeignKey('ideas', 'ideas_classification_id_foreign')) {
                $table->index('classification_id');
                $table->foreign('classification_id')
                    ->references('id')
                    ->on('idea_classifications')
                    ->nullOnDelete();
            }
        });

        Schema::table('point_transactions', function (Blueprint $table) {
            if (! $this->hasForeignKey('point_transactions', 'point_transactions_point_id_foreign')) {
                $table->index('point_id');
                $table->foreign('point_id')
                    ->references('id')
                    ->on('points')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('ideas', function (Blueprint $table) {
            $table->dropForeignIfExists('ideas_category_id_foreign');
            $table->dropForeignIfExists('ideas_classification_id_foreign');
        });

        Schema::table('point_transactions', function (Blueprint $table) {
            $table->dropForeignIfExists('point_transactions_point_id_foreign');
        });
    }

    protected function hasForeignKey(string $table, string $constraint): bool
    {
        return collect(Schema::getForeignKeys($table))
            ->contains(fn (array $fk): bool => $fk['name'] === $constraint);
    }
};
