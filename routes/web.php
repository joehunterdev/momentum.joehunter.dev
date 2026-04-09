<?php

use App\Http\Controllers\ConfigController;
use App\Http\Controllers\ContentController;
// use App\Http\Controllers\DailyController;
use App\Http\Controllers\MomentController;
use App\Http\Controllers\MomentInstanceController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WeeklyController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

// ─── Content / SEO Pages ─────────────────────────────────────────────────────
Route::get('/{locale}/{slug}', [ContentController::class, 'show'])
    ->where('locale', 'en|es')
    ->where('slug', '[a-z0-9\-]+')
    ->name('content.show');

// ─── Sitemap ─────────────────────────────────────────────────────────────────
Route::get('/sitemap.xml', function () {
    $url = rtrim(config('app.url'), '/');
    $today = now()->toDateString();

    $urls = '';

    // Static pages
    $static = [
        ['loc' => '/', 'changefreq' => 'weekly', 'priority' => '1.0'],
        ['loc' => '/login', 'changefreq' => 'monthly', 'priority' => '0.5'],
        ['loc' => '/register', 'changefreq' => 'monthly', 'priority' => '0.6'],
    ];

    foreach ($static as $page) {
        $urls .= "    <url>\n        <loc>{$url}{$page['loc']}</loc>\n        <lastmod>{$today}</lastmod>\n        <changefreq>{$page['changefreq']}</changefreq>\n        <priority>{$page['priority']}</priority>\n    </url>\n";
    }

    // Dynamic content pages
    $contentPages = ContentController::allPages();

    foreach ($contentPages as $page) {
        $priority = $page['type'] === 'blog' ? '0.7' : '0.8';
        $changefreq = $page['type'] === 'blog' ? 'monthly' : 'weekly';
        $lastmod = $page['publishedAt'] ?? $today;

        $urls .= "    <url>\n        <loc>{$url}/{$page['locale']}/{$page['slug']}</loc>\n        <lastmod>{$lastmod}</lastmod>\n        <changefreq>{$changefreq}</changefreq>\n        <priority>{$priority}</priority>\n    </url>\n";
    }

    $xml = <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{$urls}</urlset>
XML;

    return response($xml, 200)->header('Content-Type', 'application/xml');
})->name('sitemap');

Route::middleware(['auth', 'verified'])->group(function () {

    // ─── App ─────────────────────────────────────────────────────────────────
    // Route::get('/daily', [DailyController::class, 'index'])->name('daily');
    Route::get('/weekly', [WeeklyController::class, 'index'])->name('weekly');

    Route::resource('moments', MomentController::class)
        ->only(['create', 'store', 'edit', 'update', 'destroy']);

    Route::post('/moments/{moment}/toggle', [MomentInstanceController::class, 'toggle'])
        ->name('moments.toggle');

    Route::get('/config', [ConfigController::class, 'edit'])->name('config.edit');
    Route::put('/config', [ConfigController::class, 'update'])->name('config.update');

    // ─── Profile (Breeze) ─────────────────────────────────────────────────────
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
