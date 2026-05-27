<?php

// database/migrations/2024_01_01_000004_create_hero_sections_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hero_sections', function (Blueprint $table) {
            $table->id();
            $table->string('headline', 500);                          // supports HTML <span>
            $table->string('subheadline', 1000)->nullable();
            $table->string('cta_primary_text', 100)->nullable();
            $table->string('cta_primary_link', 500)->nullable();
            $table->string('cta_secondary_text', 100)->nullable();
            $table->string('cta_secondary_link', 500)->nullable();
            $table->enum('background_type', ['image', 'video', 'gradient'])->default('image');
            $table->foreignId('background_image_id')->nullable()->constrained('media')->nullOnDelete();
            $table->string('background_video_url', 500)->nullable();
            $table->unsignedTinyInteger('background_overlay_opacity')->default(50); // 0-100
            $table->string('badge_text', 200)->nullable();            // "🏆 #1 Software Agency"
            $table->json('stats')->nullable();                        // [{"label":"Projects","value":"200+"}]
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hero_sections');
    }
};
