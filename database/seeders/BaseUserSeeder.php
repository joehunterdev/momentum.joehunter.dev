<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * BaseUserSeeder - Creates core users from .env variables
 *
 * Required .env vars:
 *   SUPER_ADMIN_FIRST_NAME, SUPER_ADMIN_LAST_NAME,
 *   SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD
 */
class BaseUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('SUPER_ADMIN_EMAIL');

        if (! $email) {
            $this->command->warn('⚠️  SUPER_ADMIN_EMAIL not set in .env — skipping BaseUserSeeder');

            return;
        }

        $firstName = env('SUPER_ADMIN_FIRST_NAME', 'Super');
        $lastName  = env('SUPER_ADMIN_LAST_NAME', 'Admin');
        $password  = env('SUPER_ADMIN_PASSWORD', 'password');

        User::updateOrCreate(
            ['email' => $email],
            [
                'name'              => "{$firstName} {$lastName}",
                'email'             => $email,
                'password'          => bcrypt($password),
                'email_verified_at' => now(),
            ]
        );

        $this->command->info("✅  Super Admin created: {$email} / {$password}");
    }
}
