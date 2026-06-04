<?php

namespace App\Http\Controllers;

use App\Data\MomentData;
use App\Http\Requests\StoreMomentRequest;
use App\Http\Requests\UpdateMomentRequest;
use App\Models\Moment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class MomentController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Moments/Create');
    }

    public function store(StoreMomentRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $moment = $request->user()->moments()->create([
            'name' => $data['name'] ?? 'Untitled Moment',
            'description' => $data['description'] ?? null,
            'color' => $data['color'] ?? null,
            'icon' => $data['icon'] ?: null,
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        $moment->schedule()->create([
            'frequency' => $data['frequency'] ?? 'daily',
            'days_of_week' => $data['days_of_week'] ?? null,
            'preferred_time' => $data['preferred_time'] ?? null,
            'scheduled_date' => $data['scheduled_date'] ?? null,
            'end_date' => $data['end_date'] ?? null,
        ]);

        $moment->cue()->create([
            'implementation_intention' => $data['implementation_intention'] ?? null,
            'habit_stack_after' => $data['habit_stack_after'] ?? null,
            'environment_prompt' => $data['environment_prompt'] ?? null,
        ]);

        $moment->reward()->create([
            'description' => $data['reward_description'] ?? null,
            'temptation_bundle' => $data['temptation_bundle'] ?? null,
        ]);

        Log::info('[MomentController@store] moment created', [
            'user_id' => $request->user()->id,
            'moment_id' => $moment->id,
            'frequency' => $data['frequency'] ?? null,
            'scheduled_date' => $data['scheduled_date'] ?? null,
            'preferred_time' => $data['preferred_time'] ?? null,
            'has_icon' => ! empty($data['icon']),
        ]);

        $redirectTo = $this->safeRedirect($request, $request->input('_redirect'), route('weekly'));

        return redirect()->to($redirectTo)->with('success', 'Moment created.');
    }

    public function edit(Request $request, Moment $moment): Response
    {
        $this->authorize($moment);

        $moment->load(['schedule', 'cue', 'reward']);

        return Inertia::render('Moments/Edit', [
            'moment' => MomentData::fromModel($moment),
            // Where to send the user on save/close — the view they came from.
            'returnTo' => $this->safeRedirect($request, $request->query('return'), route('weekly')),
        ]);
    }

    public function update(UpdateMomentRequest $request, Moment $moment): RedirectResponse
    {
        $data = $request->validated();

        $moment->update([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'color' => $data['color'] ?? null,
            'icon' => $data['icon'] ?: null,
            'is_active' => $data['is_active'] ?? true,
            'sort_order' => $data['sort_order'] ?? $moment->sort_order,
        ]);

        $moment->schedule()->updateOrCreate(
            ['moment_id' => $moment->id],
            [
                'frequency' => $data['frequency'] ?? 'daily',
                'days_of_week' => $data['days_of_week'] ?? null,
                'preferred_time' => $data['preferred_time'] ?? null,
                'scheduled_date' => $data['scheduled_date'] ?? null,
                'end_date' => $data['end_date'] ?? null,
            ]
        );

        $moment->cue()->updateOrCreate(
            ['moment_id' => $moment->id],
            [
                'implementation_intention' => $data['implementation_intention'] ?? null,
                'habit_stack_after' => $data['habit_stack_after'] ?? null,
                'environment_prompt' => $data['environment_prompt'] ?? null,
            ]
        );

        $moment->reward()->updateOrCreate(
            ['moment_id' => $moment->id],
            [
                'description' => $data['reward_description'] ?? null,
                'temptation_bundle' => $data['temptation_bundle'] ?? null,
            ]
        );

        Log::info('[MomentController@update] moment updated', [
            'user_id' => $request->user()->id,
            'moment_id' => $moment->id,
            'frequency' => $data['frequency'] ?? null,
            'scheduled_date' => $data['scheduled_date'] ?? null,
            'preferred_time' => $data['preferred_time'] ?? null,
            'has_icon' => ! empty($data['icon']),
        ]);

        $redirectTo = $this->safeRedirect($request, $request->input('_redirect'), route('weekly'));

        return redirect()->to($redirectTo)->with('success', 'Moment updated.');
    }

    public function destroy(Request $request, Moment $moment): RedirectResponse
    {
        $this->authorize($moment);

        $moment->delete();

        $redirectTo = $this->safeRedirect($request, $request->input('_redirect'), route('weekly'));

        return redirect()->to($redirectTo)->with('success', 'Moment deleted.');
    }

    private function authorize(Moment $moment): void
    {
        abort_unless($moment->user_id === request()->user()->id, 403);
    }

    /**
     * Guard a caller-supplied redirect target against open-redirects: only allow
     * a same-origin relative path ("/…") or an absolute URL on the request host.
     * Anything else falls back to the default.
     */
    private function safeRedirect(Request $request, ?string $target, string $fallback): string
    {
        if (! is_string($target) || $target === '') {
            return $fallback;
        }

        if (str_starts_with($target, '/') && ! str_starts_with($target, '//')) {
            return $target;
        }

        $host = parse_url($target, PHP_URL_HOST);

        return $host !== null && $host === $request->getHost() ? $target : $fallback;
    }
}
