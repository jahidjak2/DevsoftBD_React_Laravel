<?php

// database/migrations/2024_01_01_000003_create_site_settings_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique();
            $table->longText('value')->nullable();
            $table->enum('type', ['text', 'image', 'json', 'boolean', 'color', 'textarea'])
                ->default('text');
            $table->string('group', 50)->default('general'); // general|social|contact|seo|footer
            $table->string('label', 150);                    // human-readable label for admin UI
            $table->timestamps();

            $table->index('group');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
