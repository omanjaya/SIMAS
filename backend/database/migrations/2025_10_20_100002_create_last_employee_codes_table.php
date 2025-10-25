<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('last_employee_codes', function (Blueprint $table) {
            $table->id();
            $table->string('role', 20)->unique(); // admin, teacher, employee
            $table->integer('last_number')->default(0); // Last generated number
            $table->timestamps();

            $table->index('role');
        });

        // Insert default values
        DB::table('last_employee_codes')->insert([
            ['role' => 'admin', 'last_number' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['role' => 'teacher', 'last_number' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['role' => 'employee', 'last_number' => 0, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('last_employee_codes');
    }
};
