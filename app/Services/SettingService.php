<?php

// ─────────────────────────────────────────────────────────────
// app/Services/SettingService.php
// ─────────────────────────────────────────────────────────────

namespace App\Services;

use App\Models\SiteSetting;
use Illuminate\Support\Facades\Cache;

class SettingService
{
    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::rememberForever("setting:{$key}", function () use ($key, $default) {
            $setting = SiteSetting::where('key', $key)->first();

            return $setting ? $setting->value : $default;
        });
    }

    public static function set(string $key, mixed $value): void
    {
        SiteSetting::updateOrCreate(
            ['key' => $key],
            ['value' => is_array($value) ? json_encode($value) : $value]
        );
        Cache::forget("setting:{$key}");
        Cache::forget('settings:all');
    }

    public static function setMany(array $settings): void
    {
        foreach ($settings as $key => $value) {
            static::set($key, $value);
        }
    }

    public static function getGroup(string $group): array
    {
        return Cache::rememberForever("settings:group:{$group}", function () use ($group) {
            return SiteSetting::where('group', $group)
                ->pluck('value', 'key')
                ->toArray();
        });
    }

    public static function getPublic(): array
    {
        return Cache::rememberForever('settings:public', function () {
            $publicGroups = ['general', 'social', 'contact', 'footer'];

            return SiteSetting::whereIn('group', $publicGroups)
                ->pluck('value', 'key')
                ->toArray();
        });
    }

    public static function clearCache(): void
    {
        $keys = SiteSetting::pluck('key');
        foreach ($keys as $key) {
            Cache::forget("setting:{$key}");
        }
        foreach (['general', 'social', 'contact', 'seo', 'footer'] as $g) {
            Cache::forget("settings:group:{$g}");
        }
        Cache::forget('settings:public');
        Cache::forget('settings:all');
    }
}
