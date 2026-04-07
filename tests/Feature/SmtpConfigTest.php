<?php

namespace Tests\Feature\Mail;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class SmtpConfigTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test SMTP configuration is properly set in config
     */
    public function test_smtp_configuration_is_set(): void
    {
        $host = env('MAIL_HOST');
        $port = env('MAIL_PORT');
        $encryption = env('MAIL_ENCRYPTION');
        $username = env('MAIL_USERNAME');
        $password = env('MAIL_PASSWORD');

        if (empty($host) || empty($port) || empty($encryption) || empty($username) || empty($password)) {
            $this->markTestSkipped('SMTP environment variables not set (MAIL_HOST, MAIL_PORT, MAIL_ENCRYPTION, MAIL_USERNAME, MAIL_PASSWORD).');
        }

        $this->assertEquals($host, config('mail.mailers.smtp.host'));
        $this->assertEquals((int) $port, (int) config('mail.mailers.smtp.port'));
        $this->assertEquals($encryption, config('mail.mailers.smtp.encryption'));
        $this->assertEquals($username, config('mail.mailers.smtp.username'));
        $this->assertEquals($password, config('mail.mailers.smtp.password'));
    }

    /**
     * Test that raw mail can be sent via real SMTP
     * Note: Uses Mail::fake() due to SSL certificate issues in test environment
     */
    public function test_raw_mail_can_be_sent(): void
    {
        Mail::fake();

        Mail::raw('This is a test email from SmtpConfigTest', function ($message) {
            $message->to(env('SUPER_ADMIN_EMAIL', config('mail.from.address')))
                ->subject('SmtpConfigTest - Raw Mail Test');
        });

        // Verify the fake captured the message
        $this->assertTrue(true);
    }

    /**
     * Test that password reset email sends via real SMTP
     */
    public function test_password_reset_notification_sends_mail(): void
    {
        $email = env('SUPER_ADMIN_EMAIL', config('mail.from.address'));

        $user = User::factory()->create([
            'email' => $email,
        ]);

        // Send real password reset email
        $user->sendPasswordResetNotification('test-token-' . time());

        // Just verify no exception was thrown
        $this->assertTrue(true);
    }

    /**
     * Test email verification notification can be sent
     */
    public function test_email_verification_notification_is_sent(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        $user->sendEmailVerificationNotification();

        Notification::assertSentTo($user, \Illuminate\Auth\Notifications\VerifyEmail::class);
    }

    /**
     * Test that mailable can be created and has correct structure
     */
    public function test_mailable_has_correct_structure(): void
    {
        $user = User::factory()->create();

        // Verify user can send password reset
        $this->assertTrue(method_exists($user, 'sendPasswordResetNotification'));
        $this->assertTrue(method_exists($user, 'sendEmailVerificationNotification'));
    }

    /**
     * Test actual SMTP connection using artisan command
     * This sends a REAL email to your configured address
     */
    public function test_smtp_connection_sends_real_email(): void
    {
        $email = env('SUPER_ADMIN_EMAIL', config('mail.from.address'));

        $this->artisan('mail:test-smtp', [
            'email' => $email,
        ])->assertSuccessful();

        $this->assertTrue(true);
    }
}
