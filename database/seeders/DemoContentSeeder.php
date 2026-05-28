<?php

// ─────────────────────────────────────────────────────────────
// database/seeders/DemoContentSeeder.php
// Seeds hero section, why-choose-us, industries for testing
// ─────────────────────────────────────────────────────────────

namespace Database\Seeders;

use App\Models\HeroSection;
use App\Models\Industry;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\WhyChooseUs;
use Illuminate\Database\Seeder;

class DemoContentSeeder extends Seeder
{
    public function run(): void
    {
        // Hero section
        if (HeroSection::count() === 0) {
            HeroSection::create([
                'headline' => 'Building <span class="text-blue-400">Digital Solutions</span> That Drive Growth',
                'subheadline' => 'DevSoft BD delivers cutting-edge web, mobile, and enterprise software solutions tailored to your business needs. From concept to deployment — we build it right.',
                'cta_primary_text' => 'View Our Work',
                'cta_primary_link' => '/projects',
                'cta_secondary_text' => 'Schedule a Call',
                'cta_secondary_link' => '/contact',
                'background_type' => 'gradient',
                'badge_text' => '🏆 Top-rated Software Agency in Bangladesh',
                'stats' => [
                    ['label' => 'Projects Delivered', 'value' => '250+'],
                    ['label' => 'Happy Clients',      'value' => '150+'],
                    ['label' => 'Years of Experience', 'value' => '4+'],
                ],
                'is_active' => true,
            ]);
            $this->command->info('✅ Hero section seeded.');
        }

        // Why Choose Us
        if (WhyChooseUs::count() === 0) {
            $reasons = [
                ['icon' => 'Shield',      'icon_color' => '#3B82F6', 'title' => 'Proven Track Record',      'description' => 'Over 200 successful projects delivered across 15+ countries with a 99% client satisfaction rate.',    'stat_value' => '99%',  'stat_label' => 'Client Satisfaction'],
                ['icon' => 'Zap',         'icon_color' => '#F59E0B', 'title' => 'Agile & Fast Delivery',    'description' => 'Our agile development methodology ensures rapid iterations and on-time delivery without compromising quality.', 'stat_value' => '40%',  'stat_label' => 'Faster Delivery'],
                ['icon' => 'Code2',       'icon_color' => '#10B981', 'title' => 'Expert Tech Team',         'description' => 'Our developers hold expertise in 20+ modern technologies, from React and Laravel to AI/ML and cloud infrastructure.', 'stat_value' => '20+',  'stat_label' => 'Technologies'],
                ['icon' => 'HeadphonesIcon', 'icon_color' => '#8B5CF6', 'title' => '24/7 Support',            'description' => 'Round-the-clock support and maintenance to keep your applications running smoothly at all times.',     'stat_value' => '24/7', 'stat_label' => 'Support'],
                ['icon' => 'DollarSign',  'icon_color' => '#EC4899', 'title' => 'Transparent Pricing',      'description' => 'No hidden fees, no surprises. We provide detailed proposals and stick to the agreed budget.',          'stat_value' => '0',    'stat_label' => 'Hidden Fees'],
                ['icon' => 'Globe',       'icon_color' => '#14B8A6', 'title' => 'Global Standards',         'description' => 'We follow international coding standards and best practices ensuring scalable, secure, maintainable code.', 'stat_value' => 'ISO',  'stat_label' => 'Standards'],
            ];
            foreach ($reasons as $i => $reason) {
                WhyChooseUs::create(array_merge($reason, ['sort_order' => $i, 'is_active' => true]));
            }
            $this->command->info('✅ Why choose us reasons seeded.');
        }

        // Industries
        if (Industry::count() === 0) {
            $industries = [
                ['name' => 'Healthcare',    'short_description' => 'HIPAA-compliant medical software, patient management systems, and telemedicine platforms.', 'color' => '#EF4444'],
                ['name' => 'Fintech',       'short_description' => 'Secure banking solutions, payment gateways, digital wallets, and financial analytics.', 'color' => '#10B981'],
                ['name' => 'Education',     'short_description' => 'LMS platforms, e-learning apps, student portals, and virtual classroom solutions.', 'color' => '#F59E0B'],
                ['name' => 'E-Commerce',    'short_description' => 'Full-featured online stores, marketplace platforms, and inventory management systems.', 'color' => '#8B5CF6'],
                ['name' => 'Logistics',     'short_description' => 'Fleet management, delivery tracking, warehouse management, and route optimization.', 'color' => '#6B7280'],
                ['name' => 'Real Estate',   'short_description' => 'Property listing portals, CRM systems, booking platforms, and virtual tour solutions.', 'color' => '#0EA5E9'],
                ['name' => 'Manufacturing', 'short_description' => 'ERP systems, production planning, quality control, and supply chain management.', 'color' => '#78716C'],
                ['name' => 'NGO / Non-Profit', 'short_description' => 'Donor management, volunteer tracking, impact reporting, and fundraising platforms.', 'color' => '#22C55E'],
            ];
            foreach ($industries as $i => $industry) {
                Industry::create(array_merge($industry, ['sort_order' => $i, 'is_active' => true]));
            }
            $this->command->info('✅ Industries seeded.');
        }

        // Service categories + services
        if (ServiceCategory::count() === 0) {
            $topCat = ServiceCategory::create(['name' => 'Top Services', 'sort_order' => 0, 'is_active' => true]);
            $entCat = ServiceCategory::create(['name' => 'Enterprise Solutions', 'sort_order' => 1, 'is_active' => true]);

            $services = [
                ['category_id' => $topCat->id, 'title' => 'Web Design & Development',   'icon' => 'Globe',    'short_description' => 'Modern, responsive websites and web applications built with the latest technologies.', 'is_featured' => true, 'sort_order' => 0],
                ['category_id' => $topCat->id, 'title' => 'Mobile App Development',      'icon' => 'Smartphone', 'short_description' => 'Native and cross-platform mobile apps for iOS and Android.', 'is_featured' => true, 'sort_order' => 1],
                ['category_id' => $topCat->id, 'title' => 'ML & AI Development',         'icon' => 'Brain',    'short_description' => 'Intelligent solutions powered by machine learning and artificial intelligence.', 'is_featured' => true, 'sort_order' => 2],
                ['category_id' => $topCat->id, 'title' => 'eCommerce Development',       'icon' => 'ShoppingCart', 'short_description' => 'Full-featured online stores and marketplace platforms.', 'is_featured' => true, 'sort_order' => 3],
                ['category_id' => $topCat->id, 'title' => 'QA Testing & Automation',     'icon' => 'CheckCircle', 'short_description' => 'Comprehensive testing to ensure quality and reliability.', 'is_featured' => false, 'sort_order' => 4],
                ['category_id' => $topCat->id, 'title' => 'LMS Development',             'icon' => 'BookOpen', 'short_description' => 'Learning management systems for education and corporate training.', 'is_featured' => false, 'sort_order' => 5],
                ['category_id' => $entCat->id, 'title' => 'ERP Development',             'icon' => 'LayoutGrid', 'short_description' => 'Comprehensive enterprise resource planning systems.', 'is_featured' => true, 'sort_order' => 6],
                ['category_id' => $entCat->id, 'title' => 'Cloud Solutions',             'icon' => 'Cloud',    'short_description' => 'Cloud architecture, migration, and DevOps services.', 'is_featured' => true, 'sort_order' => 7],
                ['category_id' => $entCat->id, 'title' => 'Cyber Security',              'icon' => 'Lock',     'short_description' => 'Security audits, penetration testing, and compliance solutions.', 'is_featured' => false, 'sort_order' => 8],
                ['category_id' => $entCat->id, 'title' => 'Field Force Automation',      'icon' => 'Users',    'short_description' => 'Mobile-first solutions for managing field teams and operations.', 'is_featured' => false, 'sort_order' => 9],
            ];

            foreach ($services as $service) {
                Service::create(array_merge($service, ['is_active' => true]));
            }
            $this->command->info('✅ Services seeded.');
        }

        $this->command->info('✅ Demo content seeded successfully.');
    }
}
