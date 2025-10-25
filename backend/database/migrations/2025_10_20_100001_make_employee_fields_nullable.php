<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Check database driver
        $driver = DB::getDriverName();

        Schema::table('employees', function (Blueprint $table) {
            $table->string('first_name')->nullable()->change();
            $table->string('last_name')->nullable()->change();
            $table->string('phone')->nullable()->change();
            $table->string('address')->nullable()->change();
            $table->date('date_of_birth')->nullable()->change();
            $table->string('position')->nullable()->change();
            $table->string('department')->nullable()->change();
            $table->decimal('salary', 10, 2)->nullable()->change();
        });

        // Handle enum columns differently based on database driver
        if ($driver === 'pgsql') {
            // For PostgreSQL, we need to manually alter enum columns to make them nullable
            DB::statement('ALTER TABLE employees ALTER COLUMN gender DROP NOT NULL');
            DB::statement('ALTER TABLE employees ALTER COLUMN salary_type DROP NOT NULL');
            DB::statement('ALTER TABLE employees ALTER COLUMN employment_type DROP NOT NULL');
            DB::statement('ALTER TABLE employees ALTER COLUMN employment_type SET DEFAULT \'full-time\'');
        } elseif ($driver === 'mysql') {
            // For MySQL, update to make enum columns nullable
            DB::statement('ALTER TABLE employees MODIFY COLUMN gender ENUM(\'male\', \'female\') NULL');
            DB::statement('ALTER TABLE employees MODIFY COLUMN salary_type ENUM(\'hourly\', \'monthly\') NULL');
            DB::statement('ALTER TABLE employees MODIFY COLUMN employment_type ENUM(\'full-time\', \'part-time\', \'contract\', \'intern\') NULL');
        }
        // For SQLite, we cannot alter enum columns after creation
        // The schema should already be set as nullable during the table creation
    }

    public function down(): void
    {
        // Check database driver
        $driver = DB::getDriverName();

        // Set default values for any null enum values before making them non-nullable
        DB::statement("UPDATE employees SET gender = 'male' WHERE gender IS NULL");
        DB::statement("UPDATE employees SET salary_type = 'monthly' WHERE salary_type IS NULL");
        DB::statement("UPDATE employees SET employment_type = 'full-time' WHERE employment_type IS NULL");

        Schema::table('employees', function (Blueprint $table) {
            $table->string('first_name')->nullable(false)->change();
            $table->string('last_name')->nullable(false)->change();
            $table->string('phone')->nullable(false)->change();
            $table->string('address')->nullable(false)->change();
            $table->date('date_of_birth')->nullable(false)->change();
            $table->string('position')->nullable(false)->change();
            $table->string('department')->nullable(false)->change();
            $table->decimal('salary', 10, 2)->nullable(false)->change();
        });

        // Handle enum columns differently based on database driver
        if ($driver === 'pgsql') {
            // For PostgreSQL, we need to manually alter enum columns to make them non-nullable
            DB::statement('ALTER TABLE employees ALTER COLUMN gender SET NOT NULL');
            DB::statement('ALTER TABLE employees ALTER COLUMN salary_type SET NOT NULL');
            DB::statement('ALTER TABLE employees ALTER COLUMN employment_type SET NOT NULL');
            DB::statement('ALTER TABLE employees ALTER COLUMN employment_type SET DEFAULT \'full-time\'');
        } elseif ($driver === 'mysql') {
            // For MySQL, make enum columns non-nullable
            DB::statement('ALTER TABLE employees MODIFY COLUMN gender ENUM(\'male\', \'female\') NOT NULL');
            DB::statement('ALTER TABLE employees MODIFY COLUMN salary_type ENUM(\'hourly\', \'monthly\') NOT NULL');
            DB::statement('ALTER TABLE employees MODIFY COLUMN employment_type ENUM(\'full-time\', \'part-time\', \'contract\', \'intern\') NOT NULL');
        }
        // For SQLite, we cannot alter enum columns after creation
    }
};
