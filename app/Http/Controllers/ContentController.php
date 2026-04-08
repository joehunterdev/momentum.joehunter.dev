<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class ContentController extends Controller
{
    /** Supported locales. */
    private const LOCALES = ['en', 'es'];

    /**
     * Render a content page from a JSON file.
     */
    public function show(string $locale, string $slug): Response
    {
        abort_unless(in_array($locale, self::LOCALES, true), 404);

        $path = resource_path("content/{$locale}/{$slug}.json");

        abort_unless(file_exists($path), 404);

        /** @var array<string, mixed> $content */
        $content = json_decode((string) file_get_contents($path), true);

        $alternates = [];
        if (isset($content['alternate']) && is_array($content['alternate'])) {
            foreach ($content['alternate'] as $altLocale => $altSlug) {
                $alternates[$altLocale] = url("{$altLocale}/{$altSlug}");
            }
        }
        // Include self
        $alternates[$locale] = url("{$locale}/{$slug}");

        return Inertia::render('Content/Show', [
            'content' => $content,
            'locale' => $locale,
            'alternates' => $alternates,
            'appUrl' => config('app.url'),
        ]);
    }

    /**
     * List all content pages (used for sitemap generation).
     *
     * @return array<int, array{locale: string, slug: string}>
     */
    public static function allPages(): array
    {
        $pages = [];

        foreach (self::LOCALES as $locale) {
            $dir = resource_path("content/{$locale}");

            if (! is_dir($dir)) {
                continue;
            }

            foreach (glob("{$dir}/*.json") ?: [] as $file) {
                $slug = basename($file, '.json');
                $data = json_decode((string) file_get_contents($file), true);

                $pages[] = [
                    'locale' => $locale,
                    'slug' => $slug,
                    'type' => $data['type'] ?? 'page',
                    'publishedAt' => $data['publishedAt'] ?? null,
                ];
            }
        }

        return $pages;
    }
}
