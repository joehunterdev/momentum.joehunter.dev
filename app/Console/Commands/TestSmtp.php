<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestSmtp extends Command
{
    protected $signature = 'mail:test-smtp {email : Email address to send test to}';

    protected $description = 'Send a simple test email to verify SMTP connectivity';

    public function handle(): int
    {
        $email = $this->argument('email');

        $this->info('📧 SAM Cleaning SMTP Test');
        $this->newLine();
        $this->line("Sending test email to: {$email}");
        $this->newLine();

        $this->info('SMTP Configuration:');
        $this->line('  Host: '.config('mail.mailers.smtp.host'));
        $this->line('  Port: '.config('mail.mailers.smtp.port'));
        $this->line('  Username: '.config('mail.mailers.smtp.username'));
        $this->line('  Encryption: '.config('mail.mailers.smtp.encryption'));
        $this->newLine();

        try {
            $this->info('🔄 Attempting to send...');

            Mail::raw('This is a test email from your SAM Cleaning application. If you received this, SMTP is working correctly!', function ($message) use ($email) {
                $message->to($email)
                    ->subject('Test Email - SMTP Configuration Verified')
                    ->from(config('mail.from.address'), config('mail.from.name'));
            });

            $this->newLine();
            $this->info('✅ Email sent successfully!');
            $this->newLine();
            $this->line('📨 Check your inbox at: '.$email);
            $this->line('⏱️  May take 30-60 seconds to arrive');
            $this->newLine();
            $this->line('💡 If you do not receive it:');
            $this->line('  1. Check spam/junk folder');
            $this->line('  2. Verify email address is correct');
            $this->line('  3. Check storage/logs/laravel.log for errors');
            $this->line('  4. Verify SMTP credentials in .env');
            $this->newLine();

            return self::SUCCESS;
        } catch (\Exception $e) {
            $this->newLine();
            $this->error('❌ Failed to send email!');
            $this->newLine();
            $this->error('Error: '.$e->getMessage());
            $this->newLine();
            $this->line('Troubleshooting:');
            $this->line('  1. Check .env MAIL_* settings');
            $this->line('  2. Verify MAIL_USERNAME and MAIL_PASSWORD');
            $this->line('  3. Ensure firewall allows SMTP port '.config('mail.mailers.smtp.port'));
            $this->line('  4. Check storage/logs/laravel.log for detailed errors');
            $this->newLine();

            return self::FAILURE;
        }
    }
}
