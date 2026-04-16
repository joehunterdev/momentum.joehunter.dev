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
        $this->seedDemoUser();
    }

    private function seedSuperAdmin(): void
    {
        $email = config('users.super_admin.email');

        if (! $email) {
            $this->command->warn('⚠️  SUPER_ADMIN_EMAIL not set in .env — skipping super admin');

            return;
        }

        $password = config('users.super_admin.password');

        User::updateOrCreate(
            ['email' => $email],
            [
                'first_name' => config('users.super_admin.first_name'),
                'last_name' => config('users.super_admin.last_name'),
                'password' => bcrypt($password),
                'role' => 'super_admin',
                'email_verified_at' => now(),
            ]
        );

        $this->command->info("✅  Super Admin: {$email}");
    }

    private function seedAdmin(): void
    {
        $email = config('users.admin.email');

        if (! $email) {
            return;
        }

        $password = config('users.admin.password');

        User::updateOrCreate(
            ['email' => $email],
            [
                'first_name' => config('users.admin.first_name'),
                'last_name' => config('users.admin.last_name'),
                'password' => bcrypt($password),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        $this->command->info("✅  Admin: {$email}");
    }

    private function seedTestUser(): void
    {
        $email = config('users.basic.email');

        if (! $email) {
            return;
        }

        $password = config('users.basic.password');

        User::updateOrCreate(
            ['email' => $email],
            [
                'first_name' => config('users.basic.first_name'),
                'last_name' => config('users.basic.last_name'),
                'password' => bcrypt($password),
                'role' => config('users.basic.role'),
                'email_verified_at' => now(),
            ]
        );

        $this->command->info("✅  Test User: {$email}");
    }

    private function seedDemoUser(): void
    {
        $email = config('users.demo.email');

        if (! $email) {
            return;
        }

        $password = config('users.demo.password');

        User::updateOrCreate(
            ['email' => $email],
            [
                'first_name' => config('users.demo.first_name'),
                'last_name' => config('users.demo.last_name'),
                'password' => bcrypt($password),
                'role' => config('users.demo.role'),
                'email_verified_at' => now(),
            ]
        );

        $this->command->info("✅  Demo User: {$email}");
    }
}
