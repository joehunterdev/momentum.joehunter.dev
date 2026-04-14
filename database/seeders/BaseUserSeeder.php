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
 *   BASIC_FIRST_NAME, BASIC_LAST_NAME, BASIC_EMAIL, BASIC_PASSWORD
 */
class BaseUserSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedSuperAdmin();
        $this->seedAdmin();
        $this->seedTestUser();
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

    private function seedTestUser(): void
    {
        $email = env('BASIC_EMAIL');

        if (! $email) {
            return;
        }

        $password = env('BASIC_PASSWORD', 'password');

        User::updateOrCreate(
            ['email' => $email],
            [
                'first_name' => env('BASIC_FIRST_NAME', 'Test'),
                'last_name' => env('BASIC_LAST_NAME', 'User'),
                'password' => bcrypt($password),
                'role' => env('BASIC_ROLE', 'basic'),
                'email_verified_at' => now(),
            ]
        );

        $this->command->info("✅  Test User: {$email}");
    }
}
