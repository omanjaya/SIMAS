<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('periods', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Morning Shift", "Afternoon Shift", "Period 1", etc.
            $table->time('start_time');
            $table->time('end_time');
            $table->string('code')->unique(); // e.g., "P1", "MOR", "AFT"
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->integer('order')->default(0); // To order periods chronologically
            $table->timestamps();

            $table->index(['is_active', 'order']);
            $table->index('start_time');
            $table->index('end_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('periods');
    }
};
