<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_corrections', function (Blueprint $table) {
            $table->id();

            // Foreign keys
            $table->foreignId('attendance_id')->constrained('attendances')->onDelete('cascade');
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->foreignId('requested_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');

            // Correction details
            $table->enum('correction_type', ['clock_in', 'clock_out', 'both'])->default('both');
            $table->dateTime('original_clock_in_time')->nullable();
            $table->dateTime('original_clock_out_time')->nullable();
            $table->dateTime('new_clock_in_time')->nullable();
            $table->dateTime('new_clock_out_time')->nullable();

            // Request info
            $table->text('reason')->comment('Alasan perubahan absen');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('admin_notes')->nullable()->comment('Catatan dari admin');

            // Timestamps
            $table->timestamp('requested_at')->useCurrent();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['employee_id', 'status']);
            $table->index(['attendance_id']);
            $table->index(['status', 'requested_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_corrections');
    }
};