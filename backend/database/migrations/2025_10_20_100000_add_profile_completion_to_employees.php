<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            // Track profile completion status
            $table->boolean('profile_completed')->default(false)->after('status');

            // Track first login timestamp
            $table->timestamp('first_login_at')->nullable()->after('profile_completed');

            // Add index for query performance
            $table->index('profile_completed');
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropIndex(['profile_completed']);
            $table->dropColumn(['profile_completed', 'first_login_at']);
        });
    }
};
