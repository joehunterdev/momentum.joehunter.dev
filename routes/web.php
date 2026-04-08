<?php

use App\Http\Controllers\ConfigController;
use App\Http\Controllers\DailyController;
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

Route::get('/sitemap.xml', function () {
    $url = rtrim(config('app.url'), '/');
    $today = now()->toDateString();

    $xml = <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>{$url}/</loc>
        <lastmod>{$today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>{$url}/login</loc>
        <lastmod>{$today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
    </url>
    <url>
        <loc>{$url}/register</loc>
        <lastmod>{$today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>
</urlset>
XML;

    return response($xml, 200)->header('Content-Type', 'application/xml');
})->name('sitemap');

Route::middleware(['auth', 'verified'])->group(function () {

    // ─── App ─────────────────────────────────────────────────────────────────
    Route::get('/daily', [DailyController::class, 'index'])->name('daily');
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
