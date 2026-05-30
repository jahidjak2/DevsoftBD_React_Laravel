<?php

// ─────────────────────────────────────────────────────────────
// database/seeders/EmployeeUserSeeder.php
// Creates a default employee account
// ─────────────────────────────────────────────────────────────

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EmployeeUserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => env('EMPLOYEE_EMAIL', 'employee@devsoftbd.com')],
            [
                'name' => 'Demo Employee',
                'password' => Hash::make(
                    env('EMPLOYEE_PASSWORD', '12345678')
                ),
                'role' => 'employee',
                'is_active' => true,
            ]
        );

        $this->command->info(
            '✅ Employee user created: '.
            env('EMPLOYEE_EMAIL', 'employee@devsoftbd.com')
        );

        $this->command->info(
            '   Password: '.
            env('EMPLOYEE_PASSWORD', '12345678')
        );

        $this->command->warn(
            '   ⚠ Change this password after first login!'
        );
    }
}
