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
        Schema::create('face_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->text('face_data'); // Encrypted/encoded face recognition data
            $table->string('face_encoding_method'); // Method used for face encoding
            $table->json('face_features')->nullable(); // Additional face features data
            $table->string('image_path')->nullable(); // Path to reference image
            $table->integer('confidence_threshold')->default(80); // Confidence threshold for recognition
            $table->boolean('is_active')->default(true);
            $table->timestamp('enrolled_at')->nullable();
            $table->foreignId('enrolled_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('last_verified_at')->nullable();
            $table->integer('verification_count')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('employee_id');
            $table->index('is_active');
            $table->unique('employee_id'); // Each employee can have only one face template
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('face_templates');
    }
};
