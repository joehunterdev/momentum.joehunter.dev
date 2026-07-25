<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->time('wake_time')->default('07:00');
            $table->time('sleep_time')->default('23:00');
            $table->tinyInteger('week_starts_on')->default(1); // 1=Monday, 0=Sunday
            $table->time('office_start')->default('09:00');
            $table->time('office_end')->default('17:00');
            $table->string('identity_statement', 500)->nullable();
            $table->enum('friction_level', ['auto', 'none', 'mid', 'low'])->default('auto');
            $table->unsignedTinyInteger('grace_window_days')->default(7);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_configs');
    }
};
