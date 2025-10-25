<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_validations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attendance_id')->nullable()->constrained('attendances')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->enum('validation_type', ['check_in', 'check_out']);

            // GPS Data
            $table->decimal('gps_latitude', 10, 8);
            $table->decimal('gps_longitude', 11, 8);
            $table->decimal('distance_from_location', 10, 2)->nullable();

            // Validation Status
            $table->boolean('location_validation_passed')->default(false);
            $table->boolean('schedule_validation_passed')->default(false);
            $table->boolean('face_verification_passed')->default(false);
            $table->boolean('overall_validation_passed')->default(false);

            // Validation Details
            $table->json('location_validation_details')->nullable();
            $table->json('schedule_validation_details')->nullable();
            $table->json('face_verification_details')->nullable();

            // Failed Reason
            $table->text('failed_reason')->nullable();

            // Metadata
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->string('device_info')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('employee_id');
            $table->index('validation_type');
            $table->index('overall_validation_passed');
            $table->index('created_at');
            $table->index(['employee_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_validations');
    }
};
