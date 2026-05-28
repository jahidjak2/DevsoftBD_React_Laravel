<?php

// ─────────────────────────────────────────────────────────────
// database/seeders/AdminUserSeeder.php
// Creates the first super admin account
// ─────────────────────────────────────────────────────────────

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Super admin
        User::firstOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@devsoftbd.com')],
            [
                'name' => 'Super Admin',
                'password' => Hash::make(env('ADMIN_PASSWORD', '12345678')),
                'role' => 'super_admin',
                'is_active' => true,
            ]
        );

        $this->command->info('✅ Admin user created: '.env('ADMIN_EMAIL', 'admin@devsoftbd.com'));
        $this->command->info('   Password: '.env('ADMIN_PASSWORD', '12345678'));
        $this->command->warn('   ⚠  Change this password immediately after first login!');
    }
}
