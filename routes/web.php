<?php

use App\Http\Controllers\ConfigController;
use App\Http\Controllers\DailyController;
use App\Http\Controllers\MomentController;
use App\Http\Controllers\MomentInstanceController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WeeklyController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

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
