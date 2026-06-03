<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\MomentImportService;
use Illuminate\Database\Seeder;

/**
 * Seeds the basic test user with friction-test moments.
 *
 * Each moment has a controlled completion history that maps to a specific
 * friction band, so all three levels (none / mid / low) are visible
 * side-by-side in the calendar.
 *
 * Safe to run repeatedly — existing moments for this user are cleared first.
 */
class FrictionTestSeeder extends Seeder
{
    public function __construct(public MomentImportService $importer) {}

    public function run(): void
    {
        $email = config('users.test.email');

        if (! $email) {
            $this->command->warn('⚠️  BASIC_EMAIL not set in .env — skipping FrictionTestSeeder');

            return;
        }

        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->command->warn('⚠️  Basic test user not found — run BaseUserSeeder first');

            return;
        }

        $this->importer->applyDefaultConfig($user);

        $count = $this->importer->import(
            user: $user,
            filePath: database_path('data/test-user-moments-data.json'),
        );

        $this->command->info("✅  FrictionTestSeeder: {$count} moments seeded for {$email}");
    }
}
