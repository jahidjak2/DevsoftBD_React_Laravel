<?php

// database/migrations/2024_01_01_000005_create_tags_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Tags (shared across projects, services, blog) ──────────────────
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 100)->unique();
            $table->enum('type', ['tech', 'category', 'industry'])->index();
            $table->string('color', 20)->default('#3B82F6'); // hex
            $table->timestamps();
        });

        // ── Service categories ─────────────────────────────────────────────
        Schema::create('service_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 200);
            $table->string('slug', 200)->unique();
            $table->string('icon', 100)->nullable();   // lucide icon name or inline svg
            $table->text('description')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ── Services ───────────────────────────────────────────────────────
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('service_categories')->nullOnDelete();
            $table->string('title', 300);
            $table->string('slug', 300)->unique();
            $table->string('icon', 100)->nullable();
            $table->string('short_description', 500)->nullable();
            $table->longText('description')->nullable();
            $table->json('features')->nullable();         // ["Feature A", "Feature B"]
            $table->json('technologies')->nullable();     // ["Laravel", "React"]
            $table->foreignId('thumbnail_id')->nullable()->constrained('media')->nullOnDelete();
            $table->json('process_steps')->nullable();    // [{"step":1,"title":"...","desc":"..."}]
            $table->json('faq')->nullable();              // [{"q":"...","a":"..."}]
            $table->string('cta_text', 200)->nullable();
            $table->string('cta_link', 500)->nullable();
            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->string('meta_title', 300)->nullable();
            $table->string('meta_description', 500)->nullable();
            $table->timestamps();

            $table->index('is_featured');
            $table->index('is_active');
        });

        // ── Projects ───────────────────────────────────────────────────────
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('title', 500);
            $table->string('slug', 500)->unique();
            $table->string('short_description', 500)->nullable();
            $table->longText('description')->nullable();       // rich HTML
            $table->text('challenge')->nullable();
            $table->text('solution')->nullable();
            $table->text('outcome')->nullable();
            $table->string('client_name', 255)->nullable();
            $table->string('client_country', 100)->nullable();
            $table->foreignId('client_logo_id')->nullable()->constrained('media')->nullOnDelete();
            $table->foreignId('thumbnail_id')->nullable()->constrained('media')->nullOnDelete();
            $table->string('live_url', 500)->nullable();
            $table->string('github_url', 500)->nullable();
            $table->string('case_study_url', 500)->nullable();
            $table->date('completion_date')->nullable();
            $table->string('duration', 100)->nullable();       // "3 months"
            $table->unsignedTinyInteger('team_size')->nullable();
            $table->enum('status', ['draft', 'published', 'featured'])->default('draft');
            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('homepage_sort')->default(0);
            $table->unsignedInteger('sort_order')->default(0);
            $table->unsignedInteger('views_count')->default(0);
            $table->string('meta_title', 300)->nullable();
            $table->string('meta_description', 500)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('is_featured');
            $table->index('slug');
        });

        // ── Project images (gallery) ───────────────────────────────────────
        Schema::create('project_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->foreignId('media_id')->constrained('media')->cascadeOnDelete();
            $table->string('caption', 255)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('project_id');
        });

        // ── Project ↔ Tag pivot ───────────────────────────────────────────
        Schema::create('project_tag', function (Blueprint $table) {
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained('tags')->cascadeOnDelete();
            $table->primary(['project_id', 'tag_id']);
        });

        // ── Trusted companies ─────────────────────────────────────────────
        Schema::create('trusted_companies', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->foreignId('logo_id')->nullable()->constrained('media')->nullOnDelete();
            $table->string('website_url', 500)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_tag');
        Schema::dropIfExists('project_images');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('services');
        Schema::dropIfExists('service_categories');
        Schema::dropIfExists('tags');
        Schema::dropIfExists('trusted_companies');
    }
};
