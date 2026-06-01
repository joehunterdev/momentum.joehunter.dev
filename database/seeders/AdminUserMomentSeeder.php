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
            'wake_time' => '08:15:00',
            'sleep_time' => '00:15:00',
            'office_start' => '09:30:00',
            'office_end' => '17:30:00',
            'week_starts_on' => 1,
        ]);

        $count = $this->importer->import(
            user: $user,
            filePath: database_path('data/admin-moments-data.json'),
        );

        $this->command->info("✅  Admin user moments seeded: {$count} moments for {$email}");
    }
}
