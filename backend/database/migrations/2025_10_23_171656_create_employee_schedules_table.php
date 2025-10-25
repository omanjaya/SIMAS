<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('location_id')->constrained('locations')->restrictOnDelete();
            $table->integer('day_of_week'); // 1=Senin, 7=Minggu
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('late_tolerance_minutes')->default(15);
            $table->integer('early_checkout_tolerance_minutes')->default(15);
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['employee_id', 'day_of_week', 'is_active']);
            $table->index('location_id');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_schedules');
    }
};
