<?php

namespace Database\Seeders;

use App\Models\Cue;
use App\Models\Moment;
use App\Models\MomentInstance;
use App\Models\MomentSchedule;
use App\Models\Reward;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Database\Seeder;

class MomentSeeder extends Seeder
{
    /**
     * Seed moments from database/data/moments-data.json and generate
     * 6 months of realistic instances with a gradual improvement arc.
     *
     * Each moment has:
     *   completion_rate_start — probability of completion at the start (6 months ago)
     *   completion_rate_end   — probability at today (growth over time)
     */
    public function run(): void
    {
        $user = User::where('email', config('users.super_admin.email'))->firstOrFail();

        $dataPath = database_path('data/moments-data.json');
        $moments = json_decode(file_get_contents($dataPath), true);

        $today = Carbon::today();
        $periodStart = $today->copy()->subMonths(6)->startOfDay();

        foreach ($moments as $i => $data) {
            /** @var Moment $moment */
            $moment = Moment::create([
                'user_id' => $user->id,
                'name' => $data['name'],
                'description' => $data['description'],
                'color' => $data['color'],
                'icon' => $data['icon'],
                'is_active' => true,
                'sort_order' => $i,
            ]);

            MomentSchedule::create([
                'moment_id' => $moment->id,
                'frequency' => $data['frequency'],
                'days_of_week' => $data['days_of_week'] ?? null,
                'preferred_time' => $data['preferred_time'],
            ]);

            Cue::create([
                'moment_id' => $moment->id,
                'implementation_intention' => $data['implementation_intention'],
                'habit_stack_after' => $data['habit_stack_after'],
                'environment_prompt' => $data['environment_prompt'],
            ]);

            Reward::create([
                'moment_id' => $moment->id,
                'description' => $data['reward_description'],
                'temptation_bundle' => $data['temptation_bundle'],
            ]);

            // Generate instances over the 6-month window for past dates only
            $this->generateInstances(
                moment: $moment,
                data: $data,
                periodStart: $periodStart,
                today: $today,
            );
        }
    }

    /**
     * Walk every scheduled date between $periodStart and yesterday,
     * and probabilistically mark instances as completed to simulate
     * a realistic growth arc from start → end completion rate.
     */
    private function generateInstances(Moment $moment, array $data, Carbon $periodStart, Carbon $today): void
    {
        $yesterday = $today->copy()->subDay();
        $rateStart = $data['completion_rate_start'] ?? 0.4;
        $rateEnd = $data['completion_rate_end'] ?? 0.8;
        $frequency = $data['frequency'];
        $daysOfWeek = $data['days_of_week'] ?? null; // 0=Sun … 6=Sat
        $preferredTime = $data['preferred_time'];

        $totalDays = (int) $periodStart->diffInDays($yesterday);

        /** @var CarbonPeriod $period */
        $period = CarbonPeriod::create($periodStart, '1 day', $yesterday);

        foreach ($period as $date) {
            $isScheduled = $this->isScheduledOn($date, $frequency, $daysOfWeek);

            if (! $isScheduled) {
                continue;
            }

            // Linear interpolation of completion probability over the period
            $daysIn = (int) $periodStart->diffInDays($date);
            $progress = $totalDays > 0 ? $daysIn / $totalDays : 1;
            $probability = $rateStart + ($rateEnd - $rateStart) * $progress;

            // Simulate natural variance — some weeks are better than others
            $weekJitter = (sin($daysIn / 7 * M_PI) * 0.08); // ±8 % weekly wave
            $probability = max(0, min(1, $probability + $weekJitter));

            $isCompleted = (mt_rand() / mt_getrandmax()) < $probability;

            if ($isCompleted) {
                // Mark completed a few minutes after the preferred time
                [$hour, $minute] = explode(':', $preferredTime);
                $completedAt = $date->copy()->setTime((int) $hour, (int) $minute)->addMinutes(mt_rand(5, 45));

                MomentInstance::create([
                    'moment_id' => $moment->id,
                    'date' => $date->toDateString(),
                    'completed_at' => $completedAt,
                ]);
            }
        }
    }

    /**
     * Returns true if $date falls on a scheduled occurrence for the given frequency.
     *
     * @param  int[]|null  $daysOfWeek  0=Sun, 1=Mon … 6=Sat
     */
    private function isScheduledOn(Carbon $date, string $frequency, ?array $daysOfWeek): bool
    {
        return match ($frequency) {
            'daily' => true,
            'weekly' => $daysOfWeek !== null && in_array($date->dayOfWeek, $daysOfWeek, strict: true),
            'custom' => $daysOfWeek !== null && in_array($date->dayOfWeek, $daysOfWeek, strict: true),
            default => false,
        };
    }
}
