<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            // Golongan (Rank/Grade) - e.g., "Golongan IX"
            $table->string('rank', 50)->nullable()->after('department');

            // Kelas Jabatan (Job Class) - e.g., "Kelas Jabatan 8"
            $table->string('job_class', 50)->nullable()->after('rank');

            // Besaran TPP (Performance Allowance Amount)
            $table->decimal('tpp_amount', 12, 2)->default(0)->after('job_class');

            // Jabatan Tambahan (Secondary Position)
            $table->string('secondary_position', 255)->nullable()->after('position');

            // Split address into KTP and Domisili
            $table->text('address_ktp')->nullable()->after('address');
            $table->text('address_domisili')->nullable()->after('address_ktp');
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn([
                'rank',
                'job_class',
                'tpp_amount',
                'secondary_position',
                'address_ktp',
                'address_domisili',
            ]);
        });
    }
};