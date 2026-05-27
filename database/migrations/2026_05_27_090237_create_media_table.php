<?php

// database/migrations/2024_01_01_000002_create_media_table.php
// Media must come early — many other tables FK to it

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->string('filename');                        // original name: hero-banner.jpg
            $table->string('stored_filename');                 // uuid-based: a1b2c3d4.jpg
            $table->string('path');                            // media/uploads/a1b2c3d4.jpg
            $table->string('url');                             // https://cdn.../a1b2c3d4.jpg
            $table->string('thumb_url')->nullable();           // 400x300 webp thumbnail
            $table->string('webp_url')->nullable();            // webp version of original
            $table->string('disk')->default('public');         // local | s3
            $table->string('mime_type');                       // image/jpeg
            $table->string('extension', 20);                   // jpg | png | pdf | mp4
            $table->unsignedBigInteger('size');                // bytes
            $table->unsignedInteger('width')->nullable();      // px
            $table->unsignedInteger('height')->nullable();     // px
            $table->string('alt_text')->nullable();
            $table->string('caption')->nullable();
            $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->index('mime_type');
            $table->index('extension');
            $table->index('uploaded_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
