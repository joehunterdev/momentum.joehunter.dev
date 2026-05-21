<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('moment_rewards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('moment_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('description')->nullable();
            $table->string('temptation_bundle')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('moment_rewards');
    }
};
