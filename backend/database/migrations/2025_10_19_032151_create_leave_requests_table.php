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
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->string('leave_type'); // sick, annual, emergency, personal, etc.
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('total_days');
            $table->text('reason');
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled'])->default('pending');
            $table->text('admin_notes')->nullable(); // Notes from the approving admin
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null'); // Who approved the leave
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable(); // If rejected, why
            $table->boolean('is_paid')->default(true); // Whether this is paid or unpaid leave
            $table->json('attachments')->nullable(); // Store paths to any supporting documents
            $table->timestamps();

            $table->index(['employee_id', 'status']);
            $table->index(['start_date', 'end_date']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_requests');
    }
};
