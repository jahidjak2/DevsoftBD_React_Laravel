<?php

// ─────────────────────────────────────────────────────────────
// database/seeders/LeaveTypeSeeder.php
// ─────────────────────────────────────────────────────────────

namespace Database\Seeders;

use App\Models\LeaveType;
use Illuminate\Database\Seeder;

class LeaveTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Annual Leave',   'days_allowed' => 20, 'is_paid' => true,  'carry_forward' => true,  'color' => '#3B82F6'],
            ['name' => 'Sick Leave',     'days_allowed' => 10, 'is_paid' => true,  'carry_forward' => false, 'color' => '#EF4444'],
            ['name' => 'Casual Leave',   'days_allowed' => 5,  'is_paid' => true,  'carry_forward' => false, 'color' => '#F59E0B'],
            ['name' => 'Maternity Leave', 'days_allowed' => 90, 'is_paid' => true,  'carry_forward' => false, 'color' => '#EC4899'],
            ['name' => 'Unpaid Leave',   'days_allowed' => 30, 'is_paid' => false, 'carry_forward' => false, 'color' => '#6B7280'],
        ];

        foreach ($types as $type) {
            LeaveType::firstOrCreate(['name' => $type['name']], array_merge($type, ['is_active' => true]));
        }

        $this->command->info('✅ Leave types seeded.');
    }
}
