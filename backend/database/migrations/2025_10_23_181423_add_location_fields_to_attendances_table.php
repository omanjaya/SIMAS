<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            // Add location_id if it doesn't exist
            if (!Schema::hasColumn('attendances', 'location_id')) {
                $table->foreignId('location_id')->nullable()->after('period_id')->constrained('locations')->nullOnDelete();
            }

            // Add GPS coordinates for check-in if they don't exist
            if (!Schema::hasColumn('attendances', 'check_in_latitude')) {
                $table->decimal('check_in_latitude', 10, 8)->nullable()->after('check_in_time');
            }
            if (!Schema::hasColumn('attendances', 'check_in_longitude')) {
                $table->decimal('check_in_longitude', 11, 8)->nullable()->after('check_in_latitude');
            }

            // Add GPS coordinates for check-out if they don't exist
            if (!Schema::hasColumn('attendances', 'check_out_latitude')) {
                $table->decimal('check_out_latitude', 10, 8)->nullable()->after('check_out_time');
            }
            if (!Schema::hasColumn('attendances', 'check_out_longitude')) {
                $table->decimal('check_out_longitude', 11, 8)->nullable()->after('check_out_latitude');
            }

            // Add validation status columns if they don't exist
            if (!Schema::hasColumn('attendances', 'check_in_validation_passed')) {
                $table->boolean('check_in_validation_passed')->default(false)->after('check_in_longitude');
            }
            if (!Schema::hasColumn('attendances', 'check_out_validation_passed')) {
                $table->boolean('check_out_validation_passed')->default(false)->after('check_out_longitude');
            }

            // Add distance columns if they don't exist
            if (!Schema::hasColumn('attendances', 'check_in_distance')) {
                $table->decimal('check_in_distance', 10, 2)->nullable()->after('check_in_validation_passed');
            }
            if (!Schema::hasColumn('attendances', 'check_out_distance')) {
                $table->decimal('check_out_distance', 10, 2)->nullable()->after('check_out_validation_passed');
            }

            // Add indexes if they don't exist
            if (!Schema::hasIndex('attendances', 'attendances_location_id_index')) {
                $table->index('location_id');
            }
            if (!Schema::hasIndex('attendances', 'attendances_employee_id_location_id_index')) {
                $table->index(['employee_id', 'location_id']);
            }
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            if (Schema::hasColumn('attendances', 'location_id')) {
                $table->dropForeign(['location_id']);
                $table->dropColumn('location_id');
            }
            
            $columns = [
                'check_in_latitude',
                'check_in_longitude',
                'check_out_latitude',
                'check_out_longitude',
                'check_in_validation_passed',
                'check_out_validation_passed',
                'check_in_distance',
                'check_out_distance',
            ];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('attendances', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
