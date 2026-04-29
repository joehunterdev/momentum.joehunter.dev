<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /** @var array<int, array{loc: string, changefreq: string, priority: string}> */
    private const STATIC_PAGES = [
        ['loc' => '/', 'changefreq' => 'weekly', 'priority' => '1.0'],
        ['loc' => '/login', 'changefreq' => 'monthly', 'priority' => '0.5'],
        ['loc' => '/register', 'changefreq' => 'monthly', 'priority' => '0.6'],
    ];

    public function __invoke(): Response
    {
        $baseUrl = rtrim(config('app.url'), '/');
        $today = now()->toDateString();

        $entries = collect(self::STATIC_PAGES)
            ->map(fn(array $page) => $this->staticEntry($baseUrl, $page, $today))
            ->merge(
                collect(ContentController::allPages())
                    ->map(fn(array $page) => $this->contentEntry($baseUrl, $page, $today))
            );

        $xml = view('sitemap', ['entries' => $entries])->render();

        return response($xml, 200)
            ->header('Content-Type', 'application/xml');
    }

    /** @param array{loc: string, changefreq: string, priority: string} $page */
    private function staticEntry(string $baseUrl, array $page, string $today): string
    {
        return $this->urlEntry(
            loc: $baseUrl . $page['loc'],
            lastmod: $today,
            changefreq: $page['changefreq'],
            priority: $page['priority'],
        );
    }

    /** @param array{locale: string, slug: string, type: string, publishedAt: string|null} $page */
    private function contentEntry(string $baseUrl, array $page, string $today): string
    {
        return $this->urlEntry(
            loc: "{$baseUrl}/{$page['locale']}/{$page['slug']}",
            lastmod: $page['publishedAt'] ?? $today,
            changefreq: $page['type'] === 'blog' ? 'monthly' : 'weekly',
            priority: $page['type'] === 'blog' ? '0.7' : '0.8',
        );
    }

    private function urlEntry(string $loc, string $lastmod, string $changefreq, string $priority): string
    {
        return <<<XML
            <url>
                <loc>{$loc}</loc>
                <lastmod>{$lastmod}</lastmod>
                <changefreq>{$changefreq}</changefreq>
                <priority>{$priority}</priority>
            </url>
        XML;
    }
}
