<?php

namespace App\Http\Controllers;

use App\Data\MomentData;
use App\Models\Moment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MomentController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Moments/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'color' => ['nullable', 'string', 'max:7'],
            'icon' => ['nullable', 'string', 'max:10'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            // Schedule
            'frequency' => ['nullable', 'in:daily,weekly,custom'],
            'days_of_week' => ['nullable', 'array'],
            'days_of_week.*' => ['integer', 'between:1,7'],
            'preferred_time' => ['nullable', 'date_format:H:i'],
            // Cue
            'implementation_intention' => ['nullable', 'string', 'max:255'],
            'habit_stack_after' => ['nullable', 'string', 'max:255'],
            'environment_prompt' => ['nullable', 'string', 'max:255'],
            // Reward
            'reward_description' => ['nullable', 'string', 'max:255'],
            'temptation_bundle' => ['nullable', 'string', 'max:255'],
        ]);

        $moment = $request->user()->moments()->create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'color' => $data['color'] ?? null,
            'icon' => $data['icon'] ?? null,
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        $moment->schedule()->create([
            'frequency' => $data['frequency'] ?? 'daily',
            'days_of_week' => $data['days_of_week'] ?? null,
            'preferred_time' => $data['preferred_time'] ?? null,
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

        $redirectTo = $request->input('_redirect', route('daily'));

        return redirect()->to($redirectTo)->with('success', 'Moment created.');
    }

    public function edit(Moment $moment): Response
    {
        $this->authorize($moment);

        $moment->load(['schedule', 'cue', 'reward']);

        return Inertia::render('Moments/Edit', [
            'moment' => MomentData::fromModel($moment),
        ]);
    }

    public function update(Request $request, Moment $moment): RedirectResponse
    {
        $this->authorize($moment);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'color' => ['nullable', 'string', 'max:7'],
            'icon' => ['nullable', 'string', 'max:10'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            // Schedule
            'frequency' => ['nullable', 'in:daily,weekly,custom'],
            'days_of_week' => ['nullable', 'array'],
            'days_of_week.*' => ['integer', 'between:1,7'],
            'preferred_time' => ['nullable', 'date_format:H:i'],
            // Cue
            'implementation_intention' => ['nullable', 'string', 'max:255'],
            'habit_stack_after' => ['nullable', 'string', 'max:255'],
            'environment_prompt' => ['nullable', 'string', 'max:255'],
            // Reward
            'reward_description' => ['nullable', 'string', 'max:255'],
            'temptation_bundle' => ['nullable', 'string', 'max:255'],
        ]);

        $moment->update([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'color' => $data['color'] ?? null,
            'icon' => $data['icon'] ?? null,
            'is_active' => $data['is_active'] ?? true,
            'sort_order' => $data['sort_order'] ?? $moment->sort_order,
        ]);

        $moment->schedule()->updateOrCreate(
            ['moment_id' => $moment->id],
            [
                'frequency' => $data['frequency'] ?? 'daily',
                'days_of_week' => $data['days_of_week'] ?? null,
                'preferred_time' => $data['preferred_time'] ?? null,
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

        return redirect()->route('weekly')->with('success', 'Moment updated.');
    }

    public function destroy(Moment $moment): RedirectResponse
    {
        $this->authorize($moment);

        $moment->delete();

        return redirect()->route('weekly')->with('success', 'Moment deleted.');
    }

    private function authorize(Moment $moment): void
    {
        abort_unless($moment->user_id === request()->user()->id, 403);
    }
}
