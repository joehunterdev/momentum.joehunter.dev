<?php

namespace App\Http\Controllers;

use App\Models\UserConfig;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConfigController extends Controller
{
    public function edit(Request $request): Response
    {
        $config = $request->user()
            ->config()
            ->firstOrCreate([], [
                'wake_time'      => '07:00',
                'sleep_time'     => '23:00',
                'week_starts_on' => 1,
            ]);

        return Inertia::render('Config/Edit', [
            'config' => $config,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'wake_time'      => ['required', 'date_format:H:i'],
            'sleep_time'     => ['required', 'date_format:H:i'],
            'week_starts_on' => ['required', 'integer', 'between:1,7'],
        ]);

        $request->user()
            ->config()
            ->updateOrCreate([], $data);

        return back()->with('success', 'Settings saved.');
    }
}
