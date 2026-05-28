<?php

// ─────────────────────────────────────────────────────────────
// database/seeders/DatabaseSeeder.php
// ─────────────────────────────────────────────────────────────

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            SiteSettingsSeeder::class,
            LeaveTypeSeeder::class,
            TagSeeder::class,
            DemoContentSeeder::class,
        ]);
    }
}
