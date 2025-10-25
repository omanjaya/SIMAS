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
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->foreignId('period_id')->nullable()->constrained('periods')->onDelete('set null');
            $table->timestamp('check_in_time');
            $table->timestamp('check_out_time')->nullable();
            $table->enum('attendance_type', ['manual', 'face_recognition', 'rfid'])->default('face_recognition');
            $table->string('check_in_location')->nullable(); // GPS coordinates or location name
            $table->string('check_out_location')->nullable();
            $table->string('check_in_image_path')->nullable(); // Path to check-in image
            $table->string('check_out_image_path')->nullable(); // Path to check-out image
            $table->decimal('confidence_score', 5, 2)->nullable(); // Confidence score from face recognition
            $table->json('biometric_data')->nullable(); // Additional biometric data
            $table->boolean('is_late')->default(false); // Whether the employee was late
            $table->boolean('is_early_departure')->default(false); // Whether the employee left early
            $table->integer('overtime_minutes')->default(0); // Overtime worked
            $table->integer('undertime_minutes')->default(0); // Undertime worked
            $table->text('notes')->nullable();
            $table->enum('status', ['present', 'absent', 'late', 'half_day'])->default('present');
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null'); // Who verified attendance (if manually verified)
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();

            $table->index(['employee_id', 'check_in_time']);
            $table->index('check_in_time');
            $table->index('attendance_type');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
