<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateUserConfigRequest;
use App\Services\MomentExportService;
use Illuminate\Http\JsonResponse;
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
                'wake_time' => '07:00',
                'sleep_time' => '23:00',
                'week_starts_on' => 1,
                'office_start' => '09:00',
                'office_end' => '17:00',
                'identity_statement' => null,
            ]);

        return Inertia::render('Config/Edit', [
            'config' => $config,
        ]);
    }

    public function update(UpdateUserConfigRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $request->user()
            ->config()
            ->updateOrCreate([], $data);

        return back()->with('success', 'Settings saved.');
    }

    public function exportMoments(Request $request, MomentExportService $exporter): JsonResponse
    {
        $payload = $exporter->export($request->user());
        $filename = 'moments-export-' . now()->format('Y-m-d') . '.json';

        return response()->json($payload, 200, [
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
}
