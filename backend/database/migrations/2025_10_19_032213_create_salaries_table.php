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
        Schema::create('salaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->decimal('base_salary', 10, 2); // Base salary amount
            $table->enum('salary_type', ['hourly', 'monthly'])->default('monthly'); // hourly or monthly
            $table->decimal('hourly_rate', 10, 2)->nullable(); // If hourly employee
            $table->integer('monthly_hours')->default(0); // Expected monthly hours for hourly employees
            $table->decimal('overtime_rate', 10, 2)->default(0.00); // Overtime multiplier or fixed rate
            $table->decimal('bonuses', 10, 2)->default(0.00); // Fixed bonuses
            $table->decimal('deductions', 10, 2)->default(0.00); // Fixed deductions
            $table->json('allowances')->nullable(); // JSON for various allowances (transport, meal, etc.)
            $table->json('tax_components')->nullable(); // Tax calculation details
            $table->boolean('is_active')->default(true); // Whether this salary config is currently active
            $table->date('effective_from'); // When this salary takes effect
            $table->date('effective_to')->nullable(); // When this salary ends (if applicable)
            $table->string('pay_grade')->nullable(); // Pay grade level
            $table->text('notes')->nullable(); // Additional notes
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null'); // Who updated this salary record
            $table->timestamps();

            $table->index(['employee_id', 'is_active']);
            $table->index('effective_from');
            $table->index('effective_to');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salaries');
    }
};
