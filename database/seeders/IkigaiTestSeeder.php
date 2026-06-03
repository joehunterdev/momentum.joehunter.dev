<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\MomentImportService;
use Illuminate\Database\Seeder;

/**
 * Seeds the basic test user with the Ikigai moments dataset from CSV.
 *
 * This proves the CSV import path end-to-end using a real-world, gentle
 * daily-routine dataset built around the Okinawan ikigai principles.
 *
 * Safe to run repeatedly — existing moments for this user are cleared first.
 */
class IkigaiTestSeeder extends Seeder
{
    public function __construct(public MomentImportService $importer) {}

    public function run(): void
    {
        $email = config('users.test.email');

        if (! $email) {
            $this->command->warn('⚠️  TEST_EMAIL not set in .env — skipping IkigaiTestSeeder');

            return;
        }

        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->command->warn('⚠️  Test user not found — run BaseUserSeeder first');

            return;
        }

        $this->importer->applyDefaultConfig($user, [
            'wake_time' => '07:00:00',
            'sleep_time' => '22:00:00',
            'office_start' => '09:00:00',
            'office_end' => '17:00:00',
            'week_starts_on' => 1,
            'identity_statement' => 'Love you Mum <3',
        ]);

        $count = $this->importer->import(
            user: $user,
            filePath: database_path('data/ikigai-moments-data.csv'),
            format: 'csv',
            generateHistory: false,
        );

        $this->command->info("✅  IkigaiTestSeeder: {$count} moments seeded for {$email}");
    }
}
