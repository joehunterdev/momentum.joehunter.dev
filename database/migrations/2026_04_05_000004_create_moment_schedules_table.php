<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('moment_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('moment_id')->unique()->constrained()->cascadeOnDelete();
            $table->enum('frequency', ['daily', 'weekly', 'custom'])->default('daily');
            $table->json('days_of_week')->nullable(); // e.g. [1,2,3,4,5]
            $table->time('preferred_time')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('moment_schedules');
    }
};
