<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * BaseUserSeeder - Creates core users from .env variables
 *
 * Required .env vars:
 *   SUPER_ADMIN_FIRST_NAME, SUPER_ADMIN_LAST_NAME, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD
 *
 * Optional .env vars:
 *   ADMIN_FIRST_NAME, ADMIN_LAST_NAME, ADMIN_EMAIL, ADMIN_PASSWORD
 */
class BaseUserSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedSuperAdmin();
        $this->seedAdmin();
    }

    private function seedSuperAdmin(): void
    {
        $email = env('SUPER_ADMIN_EMAIL');

        if (! $email) {
            $this->command->warn('⚠️  SUPER_ADMIN_EMAIL not set in .env — skipping super admin');

            return;
        }

        $password = env('SUPER_ADMIN_PASSWORD', 'password');

        User::updateOrCreate(
            ['email' => $email],
            [
                'first_name' => env('SUPER_ADMIN_FIRST_NAME', 'Super'),
                'last_name' => env('SUPER_ADMIN_LAST_NAME', 'Admin'),
                'password' => bcrypt($password),
                'role' => 'super_admin',
                'email_verified_at' => now(),
            ]
        );

        $this->command->info("✅  Super Admin: {$email}");
    }

    private function seedAdmin(): void
    {
        $email = env('ADMIN_EMAIL');

        if (! $email) {
            return;
        }

        $password = env('ADMIN_PASSWORD', 'password');

        User::updateOrCreate(
            ['email' => $email],
            [
                'first_name' => env('ADMIN_FIRST_NAME', 'Admin'),
                'last_name' => env('ADMIN_LAST_NAME', 'User'),
                'password' => bcrypt($password),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        $this->command->info("✅  Admin: {$email}");
    }
}
