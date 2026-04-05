<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('moment_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('implementation_intention')->nullable();
            $table->string('habit_stack_after')->nullable();
            $table->string('environment_prompt')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cues');
    }
};
