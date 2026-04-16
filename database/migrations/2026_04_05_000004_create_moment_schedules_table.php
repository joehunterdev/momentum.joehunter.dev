<?php

use App\Enums\Frequency;
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
            $table->enum('frequency', Frequency::values())->default(Frequency::Daily->value);
            $table->json('days_of_week')->nullable();
            $table->time('preferred_time')->nullable();
            $table->date('scheduled_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('moment_schedules');
    }
};
