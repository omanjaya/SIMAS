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
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('employee'); // admin, teacher, employee
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->string('status')->default('active'); // active, inactive, suspended
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'role',
                'phone',
                'address',
                'last_login_at',
                'status',
                'deleted_at',
            ]);
        });
    }
};
