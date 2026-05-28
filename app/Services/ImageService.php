<?php

// ─────────────────────────────────────────────────────────────
// app/Services/ImageService.php
// ─────────────────────────────────────────────────────────────

namespace App\Services;

use App\Models\Media;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;

class ImageService
{
    public function upload(UploadedFile $file, string $folder = 'uploads', int $userId = 0): Media
    {
        $uuid = Str::uuid()->toString();
        $ext = strtolower($file->getClientOriginalExtension());
        $disk = config('filesystems.default');

        // Store original file
        $path = $file->storeAs("media/{$folder}", "{$uuid}.{$ext}", $disk);
        $url = Storage::disk($disk)->url($path);

        $thumbUrl = null;
        $webpUrl = null;
        $width = null;
        $height = null;

        // Process images only (skip pdf, mp4, etc.)
        if (str_starts_with($file->getMimeType(), 'image/')) {
            $image = Image::read($file->getPathname());
            $width = $image->width();
            $height = $image->height();

            // WebP version (85% quality)
            $webpPath = "media/{$folder}/{$uuid}.webp";
            Storage::disk($disk)->put(
                $webpPath,
                $image->toWebp(85)->toString()
            );
            $webpUrl = Storage::disk($disk)->url($webpPath);

            // Thumbnail — 600x400 cover crop, WebP 80%
            $thumbPath = "media/{$folder}/{$uuid}_thumb.webp";
            $thumbImage = Image::read($file->getPathname());
            if ($thumbImage->width() > 600) {
                $thumbImage->cover(600, 400);
            }
            Storage::disk($disk)->put(
                $thumbPath,
                $thumbImage->toWebp(80)->toString()
            );
            $thumbUrl = Storage::disk($disk)->url($thumbPath);
        }

        return Media::create([
            'filename' => $file->getClientOriginalName(),
            'stored_filename' => "{$uuid}.{$ext}",
            'path' => $path,
            'url' => $url,
            'thumb_url' => $thumbUrl,
            'webp_url' => $webpUrl,
            'disk' => $disk,
            'mime_type' => $file->getMimeType(),
            'extension' => $ext,
            'size' => $file->getSize(),
            'width' => $width,
            'height' => $height,
            'uploaded_by' => $userId ?: auth()->id(),
        ]);
    }

    public function delete(Media $media): void
    {
        $disk = $media->disk;
        // Delete all variants
        foreach (['path', 'webp_url', 'thumb_url'] as $field) {
            if ($media->$field) {
                $relativePath = parse_url($media->$field, PHP_URL_PATH);
                $relativePath = ltrim($relativePath, '/storage/');
                Storage::disk($disk)->delete($relativePath);
            }
        }
        $media->delete();
    }
}
