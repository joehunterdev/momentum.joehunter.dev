<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\MomentImportService;
use Illuminate\Database\Seeder;

/**
 * Seeds the ADMIN_ user with the personal moments dataset.
 * Safe to run repeatedly — existing moments are cleared first.
 */
class AdminUserMomentSeeder extends Seeder
{
    public function __construct(public MomentImportService $importer) {}

    public function run(): void
    {
        $email = config('users.admin.email');

        if (! $email) {
            $this->command->warn('⚠️  ADMIN_EMAIL not set in .env — skipping admin user moments');

            return;
        }

        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->command->warn('⚠️  Admin user not found — run BaseUserSeeder first');

            return;
        }

        $this->importer->applyDefaultConfig($user, [
            'wake_time' => '07:00:00',
            'sleep_time' => '22:30:00',
        ]);

        $count = $this->importer->import(
            user: $user,
            jsonPath: database_path('data/admin-moments-data.json'),
        );

        $this->command->info("✅  Admin user moments seeded: {$count} moments for {$email}");
    }
}
