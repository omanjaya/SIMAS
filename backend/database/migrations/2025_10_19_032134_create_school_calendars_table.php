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
        Schema::create('school_calendars', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('event_type', ['holiday', 'event', 'exam', 'break', 'other'])->default('holiday');
            $table->string('color')->default('#3b82f6'); // Color code for calendar display
            $table->boolean('is_recurring')->default(false); // For recurring events like weekends
            $table->string('recurring_pattern')->nullable(); // e.g., 'yearly', 'monthly', 'weekly'
            $table->integer('recurring_interval')->nullable(); // e.g., every 2 weeks
            $table->json('metadata')->nullable(); // Additional event-specific data
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['start_date', 'end_date']);
            $table->index('event_type');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('school_calendars');
    }
};
