<?php

namespace Database\Seeders;

use App\Models\Cue;
use App\Models\Moment;
use App\Models\MomentInstance;
use App\Models\MomentSchedule;
use App\Models\Reward;
use App\Models\User;
use App\Models\UserConfig;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Database\Seeder;

/**
 * Seeds the BASIC_ test user with realistic moment + instance history.
 * Safe to run repeatedly — existing moments for this user are cleared first.
 */
class TestUserMomentSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('BASIC_EMAIL');

        if (! $email) {
            $this->command->warn('⚠️  BASIC_EMAIL not set in .env — skipping test user moments');

            return;
        }

        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->command->warn('⚠️  Test user not found — run BaseUserSeeder first');

            return;
        }

        // Clear existing moment data for this user so the seeder is idempotent
        $existingIds = Moment::where('user_id', $user->id)->pluck('id');
        MomentInstance::whereIn('moment_id', $existingIds)->delete();
        MomentSchedule::whereIn('moment_id', $existingIds)->delete();
        Cue::whereIn('moment_id', $existingIds)->delete();
        Reward::whereIn('moment_id', $existingIds)->delete();
        Moment::where('user_id', $user->id)->delete();

        // Seed a realistic user config
        UserConfig::updateOrCreate(
            ['user_id' => $user->id],
            [
                'wake_time' => '07:00:00',
                'sleep_time' => '22:00:00',
                'office_start' => '09:00:00',
                'office_end' => '17:30:00',
            ]
        );

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

            $this->generateInstances($moment, $data, $periodStart, $today);
        }

        $count = count($moments);
        $this->command->info("✅  Test user moments seeded: {$count} moments for {$email}");
    }

    /**
     * Walk every scheduled date in the 6-month window and probabilistically
     * mark instances as completed, simulating a gradual improvement arc.
     */
    private function generateInstances(Moment $moment, array $data, Carbon $periodStart, Carbon $today): void
    {
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

    /**
     * @param  int[]|null  $daysOfWeek  0=Sun, 1=Mon … 6=Sat
     */
    private function isScheduledOn(Carbon $date, string $frequency, ?array $daysOfWeek): bool
    {
        return match ($frequency) {
            'daily' => true,
            'weekly', 'custom' => $daysOfWeek !== null && in_array($date->dayOfWeek, $daysOfWeek, strict: true),
            default => false,
        };
    }
}
