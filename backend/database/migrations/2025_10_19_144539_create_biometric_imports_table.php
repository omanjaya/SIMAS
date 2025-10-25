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
        Schema::create('biometric_imports', function (Blueprint $table) {
            $table->id();
            $table->string('filename');
            $table->unsignedBigInteger('user_id'); // User who initiated the import
            $table->integer('total_records');
            $table->integer('successful_records')->default(0);
            $table->integer('failed_records')->default(0);
            $table->json('summary')->nullable(); // Summary of results
            $table->json('errors')->nullable(); // List of errors
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('biometric_imports');
    }
};
