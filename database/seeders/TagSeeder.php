<?php

// ─────────────────────────────────────────────────────────────
// database/seeders/TagSeeder.php
// Seeds common tags for projects
// ─────────────────────────────────────────────────────────────

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    public function run(): void
    {
        $tags = [
            // Tech tags
            ['name' => 'Laravel',        'type' => 'tech',     'color' => '#FF2D20'],
            ['name' => 'React',          'type' => 'tech',     'color' => '#61DAFB'],
            ['name' => 'Vue.js',         'type' => 'tech',     'color' => '#42B883'],
            ['name' => 'Next.js',        'type' => 'tech',     'color' => '#000000'],
            ['name' => 'Node.js',        'type' => 'tech',     'color' => '#339933'],
            ['name' => 'MySQL',          'type' => 'tech',     'color' => '#4479A1'],
            ['name' => 'PostgreSQL',     'type' => 'tech',     'color' => '#336791'],
            ['name' => 'MongoDB',        'type' => 'tech',     'color' => '#47A248'],
            ['name' => 'Flutter',        'type' => 'tech',     'color' => '#02569B'],
            ['name' => 'React Native',   'type' => 'tech',     'color' => '#61DAFB'],
            ['name' => 'Python',         'type' => 'tech',     'color' => '#3776AB'],
            ['name' => 'TypeScript',     'type' => 'tech',     'color' => '#3178C6'],
            ['name' => 'Tailwind CSS',   'type' => 'tech',     'color' => '#06B6D4'],
            ['name' => 'AWS',            'type' => 'tech',     'color' => '#FF9900'],
            ['name' => 'Docker',         'type' => 'tech',     'color' => '#2496ED'],
            ['name' => 'WordPress',      'type' => 'tech',     'color' => '#21759B'],

            // Category tags
            ['name' => 'Web Application', 'type' => 'category', 'color' => '#8B5CF6'],
            ['name' => 'Mobile App',     'type' => 'category', 'color' => '#06B6D4'],
            ['name' => 'E-Commerce',     'type' => 'category', 'color' => '#F59E0B'],
            ['name' => 'ERP System',     'type' => 'category', 'color' => '#10B981'],
            ['name' => 'API Development', 'type' => 'category', 'color' => '#3B82F6'],
            ['name' => 'UI/UX Design',   'type' => 'category', 'color' => '#EC4899'],
            ['name' => 'CMS',            'type' => 'category', 'color' => '#6366F1'],
            ['name' => 'SaaS',           'type' => 'category', 'color' => '#14B8A6'],

            // Industry tags
            ['name' => 'Healthcare',     'type' => 'industry', 'color' => '#EF4444'],
            ['name' => 'Fintech',        'type' => 'industry', 'color' => '#10B981'],
            ['name' => 'Education',      'type' => 'industry', 'color' => '#F59E0B'],
            ['name' => 'Retail',         'type' => 'industry', 'color' => '#8B5CF6'],
            ['name' => 'Logistics',      'type' => 'industry', 'color' => '#6B7280'],
            ['name' => 'Real Estate',    'type' => 'industry', 'color' => '#0EA5E9'],
            ['name' => 'Manufacturing',  'type' => 'industry', 'color' => '#78716C'],
            ['name' => 'NGO / Non-Profit', 'type' => 'industry', 'color' => '#22C55E'],
        ];

        foreach ($tags as $tag) {
            Tag::firstOrCreate(['name' => $tag['name']], $tag);
        }

        $this->command->info('✅ Tags seeded ('.count($tags).' tags).');
    }
}
