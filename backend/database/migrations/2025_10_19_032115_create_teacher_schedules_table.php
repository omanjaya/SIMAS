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
        Schema::create('teacher_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->foreignId('period_id')->constrained('periods')->onDelete('cascade');
            $table->string('subject'); // Subject being taught
            $table->string('class_name'); // Class/Grade name
            $table->string('room_number')->nullable();
            $table->date('date'); // Specific date for the schedule
            $table->enum('day_of_week', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']); // For recurring schedules
            $table->boolean('is_recurring')->default(false); // Whether this is a recurring schedule
            $table->string('schedule_type')->default('class'); // class, meeting, duty, etc.
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['employee_id', 'date']);
            $table->index(['date', 'period_id']);
            $table->index(['day_of_week', 'is_recurring']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teacher_schedules');
    }
};
