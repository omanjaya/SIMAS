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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('employee_code')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female'])->nullable();
            $table->string('position')->nullable();
            $table->string('department')->nullable();
            $table->date('hire_date');
            $table->enum('employment_type', ['full-time', 'part-time', 'contract', 'intern']);
            $table->decimal('salary', 10, 2)->nullable();
            $table->enum('salary_type', ['hourly', 'monthly'])->default('monthly');
            $table->json('emergency_contact')->nullable(); // Store as JSON: {name, phone, relationship}
            $table->string('profile_image')->nullable();
            $table->string('status')->default('active'); // active, inactive, terminated
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['employee_code', 'status']);
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
