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
        Schema::create('tax_settings', function (Blueprint $table) {
            $table->id();
            $table->string('bracket_name'); // e.g., "Bracket 1", "0-60 Million"
            $table->decimal('min_income', 15, 2)->default(0); // Minimum taxable income
            $table->decimal('max_income', 15, 2)->nullable(); // Maximum taxable income (null = unlimited)
            $table->decimal('tax_rate', 5, 4); // Tax rate as decimal (e.g., 0.05 = 5%)
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['is_active']);
            $table->index(['min_income', 'max_income']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tax_settings');
    }
};
