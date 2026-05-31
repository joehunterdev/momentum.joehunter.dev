<?php

namespace App\Services;

use App\Models\Cue;
use App\Models\Moment;
use App\Models\MomentInstance;
use App\Models\MomentSchedule;
use App\Models\Reward;
use App\Models\User;
use App\Models\UserConfig;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\DB;

/**
 * Imports moments from a structured JSON file into the database for a given user.
 *
 * JSON shape per moment:
 * {
 *   name, description, icon, color,
 *   frequency (daily|weekly|custom|once),
 *   days_of_week (int[] 1=Mon…7=Sun ISO, or null),
 *   preferred_time (HH:MM),
 *   implementation_intention, habit_stack_after, environment_prompt,
 *   reward_description, temptation_bundle,
 *   completion_rate_start (0–1),   // history simulation: starting rate
 *   completion_rate_end   (0–1)    // history simulation: ending rate after 6 months
 * }
 */
class MomentImportService
{
    /**
     * Import moments from a JSON file path for the given user.
     *
     * @param  string  $jsonPath  Absolute path to the JSON file.
     * @param  bool  $clearExisting  If true, wipe existing moments first.
     * @param  bool  $generateHistory  If true, simulate 6-month completion history.
     * @return int Number of moments imported.
     */
    public function import(
        User $user,
        string $jsonPath,
        bool $clearExisting = true,
        bool $generateHistory = true,
    ): int {
        if (! file_exists($jsonPath)) {
            throw new \InvalidArgumentException("JSON file not found: {$jsonPath}");
        }

        $moments = json_decode(file_get_contents($jsonPath), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \InvalidArgumentException('Invalid JSON: '.json_last_error_msg());
        }

        if ($clearExisting) {
            $this->clearUserMoments($user);
        }

        $today = Carbon::today();
        $periodStart = $today->copy()->subMonths(6)->startOfDay();

        DB::transaction(function () use ($user, $moments, $today, $periodStart, $generateHistory) {
            foreach ($moments as $i => $data) {
                /** @var Moment $moment */
                $moment = Moment::create([
                    'user_id' => $user->id,
                    'name' => $data['name'],
                    'description' => $data['description'] ?? null,
                    'color' => $data['color'] ?? null,
                    'icon' => $data['icon'] ?? null,
                    'is_active' => true,
                    'sort_order' => $i,
                ]);

                // Backdate creation to the start of the simulated history so the
                // no-backdating rule in Moment::isScheduledFor() (and therefore
                // the Stats dashboard) counts the seeded instances rather than
                // treating those pre-creation days as "not due".
                if ($generateHistory) {
                    $moment->created_at = $periodStart;
                    $moment->save();
                }

                MomentSchedule::create([
                    'moment_id' => $moment->id,
                    'frequency' => $data['frequency'],
                    'days_of_week' => $data['days_of_week'] ?? null,
                    'preferred_time' => $data['preferred_time'],
                ]);

                Cue::create([
                    'moment_id' => $moment->id,
                    'implementation_intention' => $data['implementation_intention'] ?? null,
                    'habit_stack_after' => $data['habit_stack_after'] ?? null,
                    'environment_prompt' => $data['environment_prompt'] ?? null,
                ]);

                Reward::create([
                    'moment_id' => $moment->id,
                    'description' => $data['reward_description'] ?? null,
                    'temptation_bundle' => $data['temptation_bundle'] ?? null,
                ]);

                if ($generateHistory) {
                    $this->generateInstances($moment, $data, $periodStart, $today);
                }
            }
        });

        return count($moments);
    }

    /**
     * Apply a default UserConfig to a user if one does not already exist.
     */
    public function applyDefaultConfig(User $user, array $config = []): void
    {
        UserConfig::updateOrCreate(
            ['user_id' => $user->id],
            array_merge([
                'wake_time' => '07:00:00',
                'sleep_time' => '22:30:00',
                'office_start' => '09:00:00',
                'office_end' => '17:30:00',
            ], $config)
        );
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private function clearUserMoments(User $user): void
    {
        $ids = Moment::where('user_id', $user->id)->pluck('id');
        MomentInstance::whereIn('moment_id', $ids)->delete();
        MomentSchedule::whereIn('moment_id', $ids)->delete();
        Cue::whereIn('moment_id', $ids)->delete();
        Reward::whereIn('moment_id', $ids)->delete();
        Moment::where('user_id', $user->id)->delete();
    }

    /**
     * Walk every scheduled day in the 6-month window and probabilistically
     * create instances, simulating a gradual improvement arc.
     */
    private function generateInstances(
        Moment $moment,
        array $data,
        Carbon $periodStart,
        Carbon $today,
    ): void {
        $yesterday = $today->copy()->subDay();
        $rateStart = $data['completion_rate_start'] ?? 0.4;
        $rateEnd = $data['completion_rate_end'] ?? 0.8;
        $frequency = $data['frequency'];
        $daysOfWeek = $data['days_of_week'] ?? null;
        $preferredTime = $data['preferred_time'];
        $totalDays = (int) $periodStart->diffInDays($yesterday);

        /** @var CarbonPeriod $period */
        $period = CarbonPeriod::create($periodStart, '1 day', $yesterday);

        foreach ($period as $date) {
            if (! $this->isScheduledOn($date, $frequency, $daysOfWeek)) {
                continue;
            }

            $daysIn = (int) $periodStart->diffInDays($date);
            $progress = $totalDays > 0 ? $daysIn / $totalDays : 1;
            $probability = $rateStart + ($rateEnd - $rateStart) * $progress;
            $weekJitter = sin($daysIn / 7 * M_PI) * 0.08;
            $probability = max(0, min(1, $probability + $weekJitter));

            if ((mt_rand() / mt_getrandmax()) < $probability) {
                [$hour, $minute] = explode(':', $preferredTime);
                $completedAt = $date->copy()
                    ->setTime((int) $hour, (int) $minute)
                    ->addMinutes(mt_rand(5, 45));

                MomentInstance::create([
                    'moment_id' => $moment->id,
                    'date' => $date->toDateString(),
                    'completed_at' => $completedAt,
                ]);
            }
        }
    }

    /** @param  int[]|null  $daysOfWeek  1=Mon … 7=Sun (ISO) */
    private function isScheduledOn(Carbon $date, string $frequency, ?array $daysOfWeek): bool
    {
        return match ($frequency) {
            'daily' => true,
            'recurring' => $daysOfWeek !== null && in_array($date->dayOfWeekIso, $daysOfWeek, strict: true),
            default => false,
        };
    }
}
