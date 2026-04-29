<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\MomentImportService;
use Illuminate\Database\Seeder;

/**
 * Seeds the BASIC_ test user with the generic demo moments dataset.
 * Safe to run repeatedly — existing moments for this user are cleared first.
 *
 * To use your own moments instead:
 *   php artisan moments:import --email=you@example.com --file=database/data/my-moments-data.json
 */
class TestUserMomentSeeder extends Seeder
{
    public function __construct(public MomentImportService $importer) {}

    public function run(): void
    {
        $email = config('users.basic.email');

        if (! $email) {
            $this->command->warn('⚠️  BASIC_EMAIL not set in .env — skipping test user moments');

            return;
        }

        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->command->warn('⚠️  Test user not found — run BaseUserSeeder first');

            return;
        }

        $this->importer->applyDefaultConfig($user, [
            'wake_time' => '07:00:00',
            'sleep_time' => '22:30:00',
        ]);

        $count = $this->importer->import(
            user: $user,
            jsonPath: database_path('data/moments-data.json'),
        );

        $this->command->info("✅  Test user moments seeded: {$count} moments for {$email}");
    }
}
