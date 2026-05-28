<?php

// ─────────────────────────────────────────────────────────────
// database/seeders/SiteSettingsSeeder.php
// Seeds all default site settings so the API returns valid data
// ─────────────────────────────────────────────────────────────

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class SiteSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // General
            ['key' => 'site_name',        'value' => 'DevSoft BD',                          'type' => 'text',    'group' => 'general', 'label' => 'Site Name'],
            ['key' => 'site_tagline',     'value' => 'Professional Software Development Company',   'type' => 'text',    'group' => 'general', 'label' => 'Tagline'],
            ['key' => 'logo_light',       'value' => null,                                  'type' => 'image',   'group' => 'general', 'label' => 'Logo (Light background)'],
            ['key' => 'logo_dark',        'value' => null,                                  'type' => 'image',   'group' => 'general', 'label' => 'Logo (Dark background)'],
            ['key' => 'favicon',          'value' => null,                                  'type' => 'image',   'group' => 'general', 'label' => 'Favicon'],
            ['key' => 'primary_color',    'value' => '#2563EB',                             'type' => 'color',   'group' => 'general', 'label' => 'Brand Primary Color'],

            // Contact
            ['key' => 'phone_primary',    'value' => '+8801601244650',                      'type' => 'text',    'group' => 'contact', 'label' => 'Primary Phone'],
            ['key' => 'phone_secondary',  'value' => '+8801616401375',                      'type' => 'text',    'group' => 'contact', 'label' => 'Secondary Phone'],
            ['key' => 'email_primary',    'value' => 'info@devsoftbd.com',                  'type' => 'text',    'group' => 'contact', 'label' => 'Contact Email'],
            ['key' => 'address',          'value' => 'Gazipur, Dhaka, Bangladesh',          'type' => 'text',    'group' => 'contact', 'label' => 'Office Address'],
            ['key' => 'working_hours',    'value' => 'Sat–Thu: 9:30 AM – 6:30 PM (BST)',   'type' => 'text',    'group' => 'contact', 'label' => 'Working Hours'],
            ['key' => 'google_maps_embed', 'value' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3645.2057568597515!2d90.38520537582663!3d23.988510278508624!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755db003d54b937%3A0x589b5d5dd5b45605!2sDevSoft%20BD%20-%20Software%20company!5e0!3m2!1sen!2sbd', 'type' => 'text', 'group' => 'contact', 'label' => 'Google Maps Embed URL'],

            // Social
            ['key' => 'facebook_url',     'value' => 'https://facebook.com/devsoftbdofficial',      'type' => 'text',    'group' => 'social',  'label' => 'Facebook URL'],
            ['key' => 'twitter_url',      'value' => '',                                    'type' => 'text',    'group' => 'social',  'label' => 'Twitter/X URL'],
            ['key' => 'linkedin_url',     'value' => 'https://www.linkedin.com/company/112147158/', 'type' => 'text', 'group' => 'social',  'label' => 'LinkedIn URL'],
            ['key' => 'github_url',       'value' => 'https://github.com/devsoftbd',        'type' => 'text',    'group' => 'social',  'label' => 'GitHub URL'],
            ['key' => 'instagram_url',    'value' => '',                                    'type' => 'text',    'group' => 'social',  'label' => 'Instagram URL'],
            ['key' => 'youtube_url',      'value' => '',                                    'type' => 'text',    'group' => 'social',  'label' => 'YouTube URL'],

            // SEO
            ['key' => 'meta_description', 'value' => 'DevSoft BD delivers cutting-edge web development, mobile apps, and custom software solutions. Professional software development company in Bangladesh.', 'type' => 'textarea', 'group' => 'seo', 'label' => 'Default Meta Description'],
            ['key' => 'og_image',         'value' => null,                                  'type' => 'image',   'group' => 'seo',     'label' => 'Default OG Image (1200×630)'],
            ['key' => 'google_analytics', 'value' => '',                                    'type' => 'text',    'group' => 'seo',     'label' => 'Google Analytics ID (G-XXXXXXXX)'],

            // Footer
            ['key' => 'footer_copyright', 'value' => '© '.date('Y').' DEVSOFT BD. All rights reserved.', 'type' => 'text', 'group' => 'footer', 'label' => 'Copyright Text'],
            ['key' => 'footer_about_text', 'value' => 'Professional software development company delivering cutting-edge solutions for businesses worldwide. We specialize in AI-driven development, modern web technologies, and enterprise solutions.', 'type' => 'textarea', 'group' => 'footer', 'label' => 'Footer About Text'],
        ];

        foreach ($settings as $setting) {
            SiteSetting::firstOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }

        $this->command->info('✅ Site settings seeded ('.count($settings).' settings).');
    }
}
