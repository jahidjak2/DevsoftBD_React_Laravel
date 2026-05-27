<?php

// database/migrations/2024_01_01_000006_create_sections_and_content_tables.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Team members ───────────────────────────────────────────────────
        Schema::create('team_members', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('designation', 255);
            $table->string('department', 100)->nullable();
            $table->text('bio')->nullable();
            $table->foreignId('photo_id')->nullable()->constrained('media')->nullOnDelete();
            $table->string('email', 255)->nullable();
            $table->string('linkedin_url', 500)->nullable();
            $table->string('github_url', 500)->nullable();
            $table->string('twitter_url', 500)->nullable();
            $table->json('skills')->nullable();           // ["Laravel","React","MySQL"]
            $table->boolean('is_public')->default(true); // show on public team page
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        // ── Testimonials ───────────────────────────────────────────────────
        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->string('client_name', 255);
            $table->string('client_designation', 255)->nullable(); // "CEO, ABC Corp"
            $table->string('client_company', 255)->nullable();
            $table->foreignId('client_avatar_id')->nullable()->constrained('media')->nullOnDelete();
            $table->unsignedTinyInteger('rating')->default(5); // 1-5
            $table->text('review_text');
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete();
            $table->enum('source', ['direct', 'google', 'clutch', 'upwork', 'fiverr', 'linkedin', 'other'])
                ->default('direct');
            $table->string('source_url', 500)->nullable();
            $table->boolean('is_approved')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('is_approved');
            $table->index('is_featured');
        });

        // ── Industries we serve ────────────────────────────────────────────
        Schema::create('industries', function (Blueprint $table) {
            $table->id();
            $table->string('name', 200);
            $table->string('slug', 200)->unique();
            $table->foreignId('icon_id')->nullable()->constrained('media')->nullOnDelete();
            $table->string('short_description', 500)->nullable();
            $table->longText('description')->nullable();
            $table->string('color', 20)->default('#3B82F6'); // hex for icon bg tint
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ── Why choose us ──────────────────────────────────────────────────
        Schema::create('why_choose_us', function (Blueprint $table) {
            $table->id();
            $table->string('icon', 100)->nullable();        // lucide icon name
            $table->string('icon_color', 20)->default('#3B82F6');
            $table->string('title', 200);
            $table->text('description');
            $table->string('stat_value', 50)->nullable();   // "99%"
            $table->string('stat_label', 100)->nullable();  // "Client Satisfaction"
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ── Blog categories ────────────────────────────────────────────────
        Schema::create('blog_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 200);
            $table->string('slug', 200)->unique();
            $table->text('description')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ── Blog posts ─────────────────────────────────────────────────────
        Schema::create('blog_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('blog_categories')->nullOnDelete();
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 500);
            $table->string('slug', 500)->unique();
            $table->text('excerpt')->nullable();
            $table->longText('content');
            $table->foreignId('featured_image_id')->nullable()->constrained('media')->nullOnDelete();
            $table->json('tags')->nullable();               // ["AI", "Laravel"]
            $table->unsignedTinyInteger('read_time')->default(3); // minutes
            $table->enum('status', ['draft', 'scheduled', 'published'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->unsignedInteger('views_count')->default(0);
            $table->string('meta_title', 300)->nullable();
            $table->string('meta_description', 500)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('published_at');
            $table->index('slug');
        });

        // ── Events ─────────────────────────────────────────────────────────
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title', 500);
            $table->string('slug', 500)->unique();
            $table->longText('description')->nullable();
            $table->enum('event_type', ['webinar', 'conference', 'workshop', 'meetup', 'online'])
                ->default('online');
            $table->foreignId('banner_id')->nullable()->constrained('media')->nullOnDelete();
            $table->dateTime('starts_at');
            $table->dateTime('ends_at')->nullable();
            $table->string('timezone', 100)->default('Asia/Dhaka');
            $table->string('location', 500)->nullable();
            $table->string('venue_name', 300)->nullable();
            $table->boolean('is_online')->default(true);
            $table->string('meeting_link', 500)->nullable();
            $table->string('registration_url', 500)->nullable();
            $table->unsignedInteger('max_attendees')->nullable();
            $table->enum('status', ['upcoming', 'ongoing', 'completed', 'cancelled'])->default('upcoming');
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });

        // ── Inquiries (contact form submissions) ───────────────────────────
        Schema::create('inquiries', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('email', 255);
            $table->string('phone', 50)->nullable();
            $table->string('company', 255)->nullable();
            $table->string('subject', 500)->nullable();
            $table->text('message');
            $table->string('service_interest', 200)->nullable();
            $table->string('budget_range', 100)->nullable();
            $table->enum('status', ['new', 'read', 'replied', 'spam', 'archived'])->default('new');
            $table->text('admin_note')->nullable();
            $table->timestamp('replied_at')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inquiries');
        Schema::dropIfExists('events');
        Schema::dropIfExists('blog_posts');
        Schema::dropIfExists('blog_categories');
        Schema::dropIfExists('why_choose_us');
        Schema::dropIfExists('industries');
        Schema::dropIfExists('testimonials');
        Schema::dropIfExists('team_members');
    }
};
