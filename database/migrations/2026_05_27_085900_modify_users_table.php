<?php

// database/migrations/2024_01_01_000001_modify_users_table.php
// NOTE: Laravel ships with a users migration. Run this AFTER the default one.
// This adds the role and other fields we need.

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['super_admin', 'admin', 'manager', 'employee', 'intern'])
                ->default('employee')
                ->after('email');
            $table->string('avatar')->nullable()->after('role');
            $table->boolean('is_active')->default(true)->after('avatar');
            $table->timestamp('last_login_at')->nullable()->after('is_active');
            // employee_id FK added later after employees table exists
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'avatar', 'is_active', 'last_login_at']);
        });
    }
};
