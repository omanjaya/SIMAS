<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->decimal('check_in_latitude', 10, 8)->nullable();
            $table->decimal('check_in_longitude', 11, 8)->nullable();
            $table->decimal('check_out_latitude', 10, 8)->nullable();
            $table->decimal('check_out_longitude', 11, 8)->nullable();
            $table->decimal('check_in_location_distance', 10, 2)->nullable();
            $table->decimal('check_out_location_distance', 10, 2)->nullable();
            $table->integer('check_in_late_minutes')->default(0);
            $table->integer('check_out_early_minutes')->default(0);
            $table->boolean('geofencing_validation')->default(false);
            $table->boolean('schedule_validation')->default(false);

            // Add indexes for performance
            $table->index(['check_in_latitude', 'check_in_longitude']);
            $table->index(['check_out_latitude', 'check_out_longitude']);
            $table->index('geofencing_validation');
            $table->index('schedule_validation');
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn([
                'check_in_latitude',
                'check_in_longitude',
                'check_out_latitude',
                'check_out_longitude',
                'check_in_location_distance',
                'check_out_location_distance',
                'check_in_late_minutes',
                'check_out_early_minutes',
                'geofencing_validation',
                'schedule_validation',
            ]);
        });
    }
};
