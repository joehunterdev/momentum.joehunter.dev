<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\MomentImportService;
use Illuminate\Database\Seeder;

/**
 * Seeds the DEMO_ user with the generic demo moments dataset.
 * Safe to run repeatedly — existing moments for this user are cleared first.
 */
class DemoUserMomentSeeder extends Seeder
{
    public function __construct(public MomentImportService $importer) {}

    public function run(): void
    {
        $email = config('users.demo.email');

        if (! $email) {
            $this->command->warn('⚠️  DEMO_EMAIL not set in .env — skipping demo user moments');

            return;
        }

        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->command->warn('⚠️  Demo user not found — run BaseUserSeeder first');

            return;
        }

        $this->importer->applyDefaultConfig($user);

        $count = $this->importer->import(
            user: $user,
            jsonPath: database_path('data/moments-data.json'),
        );

        $this->command->info("✅  Demo user moments seeded: {$count} moments for {$email}");
    }
}
