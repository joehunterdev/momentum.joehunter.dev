<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class RemoteCmds extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'remote:cmds {environment? : The environment to target (staging|production)} {commands?* : Specific commands to run (cache, optimize, fresh, migrate, seed, composer, dump, symlink, key-generate, logs, download-logs, clear-logs)}';

    /**
     * The description of the console command.
     *
     * @var string
     */
    protected $description = 'Generate SSH commands or fetch logs from staging/production

Examples:
  php artisan remote:cmds                          # Interactive mode
  php artisan remote:cmds staging                  # Interactive, pre-select staging
  php artisan remote:cmds staging logs             # Pre-select staging and logs with confirmation
  php artisan remote:cmds production fresh logs    # Pre-select production, fresh and logs with confirmation';

    /**
     * Whitelist of allowed commands (hardcoded, cannot be injected)
     */
    private const ALLOWED_COMMANDS = [
        'cache' => 'php artisan cache:clear && php artisan config:clear && php artisan view:clear && php artisan route:clear',
        'optimize' => 'php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan event:cache',
        'fresh' => 'php artisan migrate:fresh --seed --force --no-interaction -v',
        'migrate' => 'php artisan migrate --force --no-interaction -v',
        'seed' => 'php artisan db:seed --force --no-interaction -v',
        'composer' => 'composer install --no-dev --no-interaction --optimize-autoloader --ignore-platform-reqs',
        'dump' => 'composer dump-autoload --ignore-platform-reqs',
        'symlink' => 'php artisan storage:link',
        'key-generate' => 'php artisan key:generate --force',
    ];

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🚀 Remote Commands Manager');
        $this->newLine();

        // Security: Verify running in local environment only
        if (config('app.env') !== 'local') {
            $this->error('❌ SECURITY: SSH commands should only be run from local environment (APP_ENV=local)');
            $this->line('This tool is restricted to prevent accidental remote execution on production servers.');

            return self::FAILURE;
        }

        // Security: Verify SSH credentials are configured
        if (! $this->validateSSHConfiguration()) {
            return self::FAILURE;
        }

        // Step 1: Determine environment
        $env = $this->argument('environment');

        if (! $env) {
            $env = $this->choice(
                'Select target environment:',
                ['staging', 'production']
            );
        } elseif (! in_array($env, ['staging', 'production'])) {
            $this->error("Invalid environment: {$env}. Must be 'staging' or 'production'.");

            return self::FAILURE;
        }

        // Confirm for production
        if ($env === 'production' && ! $this->confirm('⚠️  You are about to work with PRODUCTION. Continue?')) {
            $this->info('Cancelled.');

            return self::FAILURE;
        }

        // Load environment-specific config
        $envFile = ".env.{$env}";
        if (! file_exists(base_path($envFile))) {
            $this->error("❌ Configuration file {$envFile} not found");

            return self::FAILURE;
        }

        // Get SSH credentials from main .env (local environment)
        $sshUser = env('SSH_USER');
        $sshHost = env('SSH_HOST');
        $sshPort = env('SSH_PORT', 22);
        $sshKeyPath = env('SSH_KEY_PATH');

        // Get path from main .env
        $pathKey = 'SSH_PATH_' . strtoupper($env);
        $remotePath = env($pathKey);

        if (! $remotePath) {
            $this->error("❌ {$pathKey} not configured in .env");

            return self::FAILURE;
        }

        // Get PHP path from main .env (optional, defaults to 'php')
        $phpPathKey = 'SSH_PHP_PATH_' . strtoupper($env);
        $phpPath = env($phpPathKey, 'php');

        // Security: Validate remote path format
        if (! $this->validateRemotePath($remotePath)) {
            $this->error('❌ Invalid remote path format. Must be absolute path.');

            return self::FAILURE;
        }

        // Display environment info
        $this->newLine();
        $this->info("📍 Environment: {$env}");
        $this->line("   SSH Target: {$sshUser}@{$sshHost}:{$sshPort}");
        $this->line('   SSH Key: ' . ($sshKeyPath ?: '(system default)'));
        $this->line("   Remote Path: {$remotePath}");
        $this->line("   PHP Path: {$phpPath}");

        // Step 2: Test connection
        $this->newLine();
        $this->info('Testing SSH connection...');
        if (! $this->testSSHConnection($sshUser, $sshHost, $sshPort)) {
            $this->error("❌ Failed to connect to {$sshUser}@{$sshHost}:{$sshPort}");

            return self::FAILURE;
        }

        $this->info('✓ Connection established');
        $this->newLine();

        // Step 3: Get commands to execute
        $requestedCommands = $this->argument('commands');

        if (empty($requestedCommands)) {
            // Interactive mode - use verbose display
            $selectedCommands = $this->multiSelectVerbose(
                'Select actions to view/execute:',
                $this->buildVerboseOptions()
            );
        } else {
            // Validate provided commands against whitelist
            $selectedCommands = [];
            foreach ($requestedCommands as $cmd) {
                if ($this->isCommandAllowed($cmd)) {
                    $selectedCommands[] = $cmd;
                } else {
                    $this->warn("Unknown or disallowed command: {$cmd}. Skipping.");
                }
            }

            if (empty($selectedCommands)) {
                $this->error('No valid commands provided.');

                return self::FAILURE;
            }

            // Show what will be executed and ask for confirmation
            $this->info('📋 Commands to execute:');
            foreach ($selectedCommands as $cmd) {
                $this->line("  • {$cmd}");
            }
            $this->newLine();

            if (! $this->confirm('Execute these commands?', false)) {
                $this->info('Cancelled.');

                return self::SUCCESS;
            }
        }

        if (empty($selectedCommands)) {
            $this->warn('No actions selected.');

            return self::SUCCESS;
        }

        $this->newLine();

        // Handle special commands
        if (in_array('logs', $selectedCommands)) {
            $this->displayLogs($sshUser, $sshHost, $remotePath, $env, $sshPort);
            $this->newLine();
        }

        if (in_array('download-logs', $selectedCommands)) {
            $this->downloadLogs($sshUser, $sshHost, $remotePath, $env, $sshPort);
            $this->newLine();
        }

        if (in_array('clear-logs', $selectedCommands)) {
            if ($this->confirm('⚠️  Clear ALL log files from remote server? This cannot be undone!', false)) {
                $this->clearRemoteLogs($sshUser, $sshHost, $remotePath, $env, $sshPort);
            } else {
                $this->info('Clear logs cancelled.');
            }
            $this->newLine();
        }

        if (in_array('reset-sync', $selectedCommands)) {
            if ($this->confirm('⚠️  Reset FTP deploy sync state? This will force a full re-deployment on next push.', false)) {
                $this->resetFtpSyncState($sshUser, $sshHost, $sshPort, $remotePath);
            }
            $this->newLine();
        }

        if (in_array('check-sync', $selectedCommands)) {
            $this->checkRemoteFtpSyncState($sshUser, $sshHost, $sshPort, $remotePath);
            $this->newLine();
        }

        if (in_array('restore-sync', $selectedCommands)) {
            if ($this->confirm('⚠️  Restore FTP sync state from latest backup?', false)) {
                $this->restoreFtpSyncStateFromBackup($sshUser, $sshHost, $sshPort, $remotePath);
            }
            $this->newLine();
        }

        // If 'all' is selected, add all commands
        if (in_array('all', $selectedCommands)) {
            $selectedCommands = array_keys(self::ALLOWED_COMMANDS);
        } else {
            // Filter to only keep actual commands (not 'logs', 'all', or 'reset-sync')
            $selectedCommands = array_filter($selectedCommands, fn($cmd) => isset(self::ALLOWED_COMMANDS[$cmd]));
        }

        // Display selected commands
        if (! empty($selectedCommands)) {
            $this->displayCommands($selectedCommands, $remotePath, $phpPath);

            // Ask if user wants to execute
            if ($this->confirm('Execute these commands now via SSH?', false)) {
                // Log execution for audit trail
                $this->logCommandExecution($env, $selectedCommands);

                $this->newLine();
                $this->executeCommands($sshUser, $sshHost, $sshPort, $remotePath, $selectedCommands, $phpPath);
            }
        }

        // Finish handle with success code
        return self::SUCCESS;
    }

    /**
     * Get SSH key option string if SSH_KEY_PATH is configured
     */
    private function getSshKeyOption(): string
    {
        $keyPath = env('SSH_KEY_PATH');
        if ($keyPath && file_exists($keyPath)) {
            return '-i ' . escapeshellarg($keyPath) . ' ';
        }

        return '';
    }

    /**
     * Test SSH connection
     */
    private function testSSHConnection(string $user, string $host, int $port = 22): bool
    {
        $this->line("Attempting SSH connection to {$user}@{$host}:{$port}...");
        $keyOption = $this->getSshKeyOption();

        // Use timeout to prevent hanging (5 seconds)
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            // Windows timeout syntax
            $cmd = "timeout /t 5 /nobreak & ssh {$keyOption}-p {$port} -o ConnectTimeout=3 -o StrictHostKeyChecking=no {$user}@{$host} exit 2>&1";
        } else {
            // Linux/Mac timeout syntax
            $cmd = "timeout 5 ssh {$keyOption}-p {$port} -o ConnectTimeout=3 -o StrictHostKeyChecking=no {$user}@{$host} exit 2>&1";
        }

        $this->line("<fg=gray>Command: {$cmd}</>");

        exec($cmd, $output, $returnCode);

        // Ensure SSH process is killed
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            exec('taskkill /F /IM ssh.exe 2>nul', $killOutput, $killCode);
        } else {
            exec('pkill -f ssh 2>/dev/null', $killOutput, $killCode);
        }

        if (! empty($output)) {
            $this->line('<fg=gray>Output: ' . implode(' | ', $output) . '</>');
        }
        $this->line("<fg=gray>Return code: {$returnCode}</>");

        // Check if ssh command exists
        if (isset($output[0]) && (str_contains($output[0], 'not recognized') || str_contains($output[0], 'not found'))) {
            $this->warn('⚠️  SSH not available on this system. Skipping connection test.');

            return true;
        }

        // Success if return code is 0
        return $returnCode === 0;
    }

    /**
     * Display selected commands
     */
    private function displayCommands(array $selectedCommands, string $remotePath, string $phpPath = 'php'): void
    {
        $this->info('✅ Commands selected:');
        $this->newLine();

        foreach ($selectedCommands as $cmd) {
            if (isset(self::ALLOWED_COMMANDS[$cmd])) {
                $command = $this->replacePhpPath(self::ALLOWED_COMMANDS[$cmd], $phpPath);
                $this->line("<fg=green>✓ {$cmd}</>");
                $this->line('   Command: ' . $command);
                $this->line("   Path: cd {$remotePath} && " . $command);
                $this->newLine();
            }
        }

        $this->info('💡 Output Notes:');
        $this->line('  • fresh: Shows all tables dropped and migrated, seeder feedback');
        $this->line('  • migrate: Shows each migration file run');
        $this->line('  • seed: Shows seeder progress and records created');
        $this->line('  • cache: Clears all application caches');
        $this->line('  • composer: Installs dependencies optimally');
        $this->newLine();
        $this->line('Execute these commands via SSH or your deployment tool to see full terminal output.');
    }

    /**
     * Display logs
     */
    private function displayLogs(string $user, string $host, string $remotePath, string $env, int $sshPort = 22): void
    {
        $logPath = "{$remotePath}/storage/logs";
        $lines = 100; // Default to 100 lines

        $this->info("📋 Fetching logs from {$env}");
        $this->newLine();

        // Get list of available log files
        $logFiles = $this->getRemoteLogFiles($user, $host, $logPath, $sshPort);

        if (empty($logFiles)) {
            $this->warn('No log files found on remote server.');

            return;
        }

        // Display available files
        $this->line('<fg=cyan>Available log files:</>');
        foreach ($logFiles as $index => $file) {
            $this->line("  [{$index}] {$file}");
        }
        $this->newLine();

        // Build choices: "all" plus each actual log file
        $choices = ['all'];
        foreach ($logFiles as $file) {
            $choices[] = $file;
        }

        $selected = $this->choice(
            'Which log file(s) to view?',
            $choices,
            'all'
        );

        if ($selected === 'all') {
            // Fetch important logs that exist on remote
            $logsToFetch = [];

            // Always include laravel.log if it exists
            if (in_array('laravel.log', $logFiles)) {
                $logsToFetch[] = 'laravel.log';
            }

            // Get latest payments log (sorted first due to date sorting)
            $paymentsLog = collect($logFiles)->first(fn($f) => str_starts_with($f, 'payments-'));
            if ($paymentsLog) {
                $logsToFetch[] = $paymentsLog;
            }

            // Get latest jobs log
            $jobsLog = collect($logFiles)->first(fn($f) => str_starts_with($f, 'jobs-'));
            if ($jobsLog) {
                $logsToFetch[] = $jobsLog;
            }

            if (empty($logsToFetch)) {
                $this->warn('No standard log files found. Fetching first available log.');
                $logsToFetch[] = $logFiles[0];
            }

            $this->info('Fetching: ' . implode(', ', $logsToFetch));
            $this->newLine();

            foreach ($logsToFetch as $logFile) {
                $this->displayRemoteLogFile($user, $host, $logPath, $logFile, $lines, $env, $sshPort);
            }
        } else {
            // Fetch the selected log file
            $this->displayRemoteLogFile($user, $host, $logPath, $selected, $lines, $env, $sshPort);
        }
    }

    /**
     * Get list of log files from remote server
     */
    private function getRemoteLogFiles(string $user, string $host, string $logPath, int $sshPort = 22): array
    {
        $keyOption = $this->getSshKeyOption();
        $cmd = sprintf(
            'ssh %s-p %d %s@%s "ls -1 %s/*.log 2>/dev/null | xargs -n1 basename 2>/dev/null" 2>&1',
            $keyOption,
            $sshPort,
            escapeshellarg($user),
            escapeshellarg($host),
            escapeshellarg($logPath)
        );

        exec($cmd, $output, $returnCode);

        if ($returnCode !== 0 || empty($output)) {
            return [];
        }

        // Filter out empty lines and sort (newest dated logs first)
        $files = array_filter($output, fn($f) => ! empty(trim($f)));

        // Sort: dated logs descending, then alphabetically
        usort($files, function ($a, $b) {
            $aHasDate = preg_match('/\d{4}-\d{2}-\d{2}/', $a);
            $bHasDate = preg_match('/\d{4}-\d{2}-\d{2}/', $b);

            if ($aHasDate && $bHasDate) {
                return strcmp($b, $a); // Descending for dated files
            }
            if ($aHasDate) {
                return 1;
            }
            if ($bHasDate) {
                return -1;
            }

            return strcmp($a, $b); // Alphabetical for non-dated
        });

        return array_values($files);
    }

    /**
     * Display a specific remote log file
     */
    private function displayRemoteLogFile(string $user, string $host, string $logPath, string $logFile, int $lines, string $env, int $sshPort = 22): void
    {
        $fullPath = "{$logPath}/{$logFile}";

        $this->newLine();
        $this->line("<fg=yellow>═══ {$logFile} (last {$lines} lines) ═══</>");

        $keyOption = $this->getSshKeyOption();
        $cmd = sprintf(
            'ssh %s-p %d %s@%s "tail -n %d %s 2>&1" 2>&1',
            $keyOption,
            $sshPort,
            escapeshellarg($user),
            escapeshellarg($host),
            (int) $lines,
            escapeshellarg($fullPath)
        );

        exec($cmd, $output, $returnCode);

        if ($returnCode === 0 && ! empty($output)) {
            foreach ($output as $line) {
                $this->colorizeLogLine($line);
            }
        } else {
            $fullOutput = implode(' ', $output);
            if (str_contains($fullOutput, 'Permission denied')) {
                $this->warn("  ❌ Permission denied reading {$logFile}");
            } elseif (str_contains($fullOutput, 'No such file')) {
                $this->warn("  ⚠️  File not found: {$logFile}");
            } else {
                $this->warn("  Could not fetch {$logFile}");
            }
        }

        $this->line('<fg=cyan>═══════════════════════════════════════════════</>');
    }

    /**
     * Download log files from remote server
     */
    private function downloadLogs(string $user, string $host, string $remotePath, string $env, int $sshPort = 22): void
    {
        $remoteLogPath = "{$remotePath}/storage/logs";
        $localLogPath = storage_path("logs/remote/{$env}");

        $this->info("📥 Downloading logs from {$env}");
        $this->newLine();

        // Create local directory if it doesn't exist
        if (! is_dir($localLogPath)) {
            mkdir($localLogPath, 0755, true);
            $this->line("Created directory: {$localLogPath}");
        }

        // Get list of available log files
        $logFiles = $this->getRemoteLogFiles($user, $host, $remoteLogPath, $sshPort);

        if (empty($logFiles)) {
            $this->warn('No log files found on remote server.');

            return;
        }

        // Display available files
        $this->line('<fg=cyan>Available log files:</>');
        foreach ($logFiles as $index => $file) {
            $this->line("  [{$index}] {$file}");
        }
        $this->newLine();

        // Build choices
        $choices = ['all', 'select'];
        foreach ($logFiles as $file) {
            $choices[] = $file;
        }

        $selected = $this->choice(
            'Which log file(s) to download?',
            $choices,
            'all'
        );

        $filesToDownload = [];

        if ($selected === 'all') {
            $filesToDownload = $logFiles;
        } elseif ($selected === 'select') {
            // Multi-select implementation
            $input = $this->ask('Enter file numbers (comma-separated, e.g., "0,2,5")');
            if (! empty(trim($input))) {
                $indices = array_map('trim', explode(',', $input));
                foreach ($indices as $idx) {
                    if (is_numeric($idx) && isset($logFiles[(int) $idx])) {
                        $filesToDownload[] = $logFiles[(int) $idx];
                    }
                }
            }
        } else {
            $filesToDownload = [$selected];
        }

        if (empty($filesToDownload)) {
            $this->warn('No files selected.');

            return;
        }

        $this->info('Downloading: ' . implode(', ', $filesToDownload));
        $this->newLine();

        $keyOption = $this->getSshKeyOption();
        $successCount = 0;
        $failCount = 0;

        foreach ($filesToDownload as $logFile) {
            $remotePath = "{$remoteLogPath}/{$logFile}";
            $localPath = "{$localLogPath}/{$logFile}";

            // Use SCP to download
            $cmd = sprintf(
                'scp %s-P %d %s@%s:%s %s 2>&1',
                $keyOption,
                $sshPort,
                escapeshellarg($user),
                escapeshellarg($host),
                escapeshellarg($remotePath),
                escapeshellarg($localPath)
            );

            exec($cmd, $output, $returnCode);

            if ($returnCode === 0 && file_exists($localPath)) {
                $size = filesize($localPath);
                $this->line("  ✓ {$logFile} (" . $this->formatBytes($size) . ')');
                $successCount++;
            } else {
                $this->line("  ✗ {$logFile} - failed");
                $failCount++;
            }
        }

        $this->newLine();
        $this->info("✓ Downloaded {$successCount} file(s) to: {$localLogPath}");
        if ($failCount > 0) {
            $this->warn("✗ Failed to download {$failCount} file(s)");
        }
    }

    /**
     * Clear log files on remote server
     */
    private function clearRemoteLogs(string $user, string $host, string $remotePath, string $env, int $sshPort = 22): void
    {
        $logPath = "{$remotePath}/storage/logs";

        $this->info("🗑️  Clearing logs on {$env}");
        $this->newLine();

        // Get list of log files
        $logFiles = $this->getRemoteLogFiles($user, $host, $logPath, $sshPort);

        if (empty($logFiles)) {
            $this->warn('No log files found on remote server.');

            return;
        }

        // Display files that will be cleared
        $this->line('<fg=yellow>Log files to be cleared:</>');
        foreach ($logFiles as $file) {
            $this->line("  • {$file}");
        }
        $this->newLine();

        // Final confirmation
        if (! $this->confirm('Are you absolutely sure?', false)) {
            $this->info('Cancelled.');

            return;
        }

        $keyOption = $this->getSshKeyOption();

        // Clear all .log files
        $cmd = sprintf(
            'ssh %s-p %d %s@%s "rm -f %s/*.log" 2>&1',
            $keyOption,
            $sshPort,
            escapeshellarg($user),
            escapeshellarg($host),
            escapeshellarg($logPath)
        );

        exec($cmd, $output, $returnCode);

        if ($returnCode === 0) {
            $this->info('✓ All log files cleared successfully');
        } else {
            $this->error('✗ Failed to clear log files');
            if (! empty($output)) {
                $this->line('Error: ' . implode("\n", $output));
            }
        }
    }

    /**
     * Format bytes to human readable size
     */
    private function formatBytes(int $bytes): string
    {
        if ($bytes < 1024) {
            return "{$bytes} B";
        } elseif ($bytes < 1048576) {
            return round($bytes / 1024, 2) . ' KB';
        } elseif ($bytes < 1073741824) {
            return round($bytes / 1048576, 2) . ' MB';
        } else {
            return round($bytes / 1073741824, 2) . ' GB';
        }
    }

    /**
     * Parse .env file into array
     */
    private function parseEnvFile(string $filename): array
    {
        $path = base_path($filename);
        $vars = [];

        if (! file_exists($path)) {
            return $vars;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (str_starts_with(trim($line), '#')) {
                continue;
            }

            if (str_contains($line, '=')) {
                [$key, $value] = explode('=', $line, 2);
                $vars[trim($key)] = trim($value, '"\'');
            }
        }

        return $vars;
    }

    /**
     * Build available commands (uses whitelist constant)
     */
    private function buildCommands(): array
    {
        return self::ALLOWED_COMMANDS;
    }

    /**
     * Fetch and display remote logs
     */
    private function fetchRemoteLogs(string $user, string $host, string $remotePath, string $env): int
    {
        $logPath = "{$remotePath}/storage/logs";
        $lines = $this->option('lines');

        $this->info("📋 Fetching logs from {$env}");
        $this->line("Connection: {$user}@{$host}");
        $this->newLine();

        // Display available log files
        $this->displayAvailableLogs($user, $host, $logPath);

        // Fetch laravel.log
        $this->displayRemoteLogs($user, $host, $logPath, $lines, $env);

        return self::SUCCESS;
    }

    /**
     * Display available log files on remote
     */
    private function displayAvailableLogs(string $user, string $host, string $logPath, int $sshPort = 22): void
    {
        $this->line('<fg=cyan>Available log files:</></>');
        $this->line("  Path: {$logPath}");

        // Check if path exists first
        $keyOption = $this->getSshKeyOption();
        $checkCmd = sprintf(
            'ssh %s-p %d %s@%s "test -d %s && echo exists || echo notfound" 2>&1',
            $keyOption,
            $sshPort,
            escapeshellarg($user),
            escapeshellarg($host),
            escapeshellarg($logPath)
        );

        exec($checkCmd, $checkOutput, $checkCode);
        $pathExists = isset($checkOutput[0]) && strpos($checkOutput[0], 'exists') !== false;

        if (! $pathExists) {
            $this->warn('  ⚠️  Log path not found on remote server');
            $this->line('  Trying alternate path...');

            return;
        }

        // List files in log directory
        $cmd = sprintf(
            'ssh %s-p %d %s@%s "ls -lh %s 2>&1" 2>&1',
            $keyOption,
            $sshPort,
            escapeshellarg($user),
            escapeshellarg($host),
            escapeshellarg($logPath)
        );

        exec($cmd, $output, $returnCode);

        // Check for permission denied
        $fullOutput = implode(' ', $output);
        if (str_contains($fullOutput, 'Permission denied') || str_contains($fullOutput, 'Permission not allowed')) {
            $this->warn('  ❌ Permission denied reading log directory');
            $this->line('  Cannot list log files (insufficient permissions)');
            $this->newLine();

            return;
        }

        if ($returnCode === 0 && ! empty($output)) {
            foreach ($output as $line) {
                $this->line("  {$line}");
            }
        } else {
            $this->warn('  Could not list log files');
            if (! empty($output)) {
                $this->line('  Error: ' . implode(' ', $output));
            }
        }
        $this->newLine();
    }

    /**
     * Display Laravel log with color coding
     */
    private function displayRemoteLogs(string $user, string $host, string $logPath, int $lines, string $env, bool $saveLogs, int $sshPort = 22): void
    {
        $logFile = "{$logPath}/laravel.log";

        $this->line('<fg=yellow>Fetching laravel.log (last ' . $lines . ' lines):</></>');
        $this->line("<fg=gray>Log file: {$logFile}</>");
        $this->line('<fg=cyan>═══════════════════════════════════════════════</>');

        // Build properly escaped SSH command with error capture
        $keyOption = $this->getSshKeyOption();
        $cmd = sprintf(
            'ssh %s-p %d %s@%s "tail -n %d %s 2>&1" 2>&1',
            $keyOption,
            $sshPort,
            escapeshellarg($user),
            escapeshellarg($host),
            (int) $lines,
            escapeshellarg($logFile)
        );

        $this->line("<fg=gray>Command: {$cmd}</>");
        $this->newLine();

        exec($cmd, $output, $returnCode);

        // Check for permission denied error
        $fullOutput = implode(' ', $output);
        if (str_contains($fullOutput, 'Permission denied') || str_contains($fullOutput, 'Permission not allowed')) {
            $this->error('❌ Permission Denied: Cannot access laravel.log via SSH');
            $this->newLine();
            $this->warn('🔐 Permission Issue:');
            $this->line('The SSH user does not have read permissions for the log file.');
            $this->newLine();
            $this->info('✅ Options (in order of ease):');
            $this->newLine();
            $this->line('<fg=green>Option 1: Download via SCP (This Tool)</></>');
            if ($this->confirm('  Attempt to download log file via SCP?')) {
                $this->downloadLogViaSCP($user, $host, $logPath, $env, $sshPort);
            }
            $this->newLine();
            $this->line('<fg=green>Option 2: Use cPanel File Manager</></>');
            $this->line('  1. Log in to your hosting cPanel');
            $this->line('  2. Open File Manager');
            $this->line('  3. Navigate to: storage/logs/');
            $this->line('  4. Right-click laravel.log → Change Permissions');
            $this->line('  5. Set to 644, then retry this command');
            $this->newLine();
            $this->line('<fg=green>Option 3: Download via FTP</></>');
            $this->line('  1. Connect via FTP client (FileZilla, WinSCP, etc)');
            $this->line('  2. Navigate to: storage/logs/');
            $this->line('  3. Download laravel.log locally');
            $this->line('  4. View the file on your machine');
            $this->newLine();
            $this->line('<fg=green>Option 4: Contact Hosting Provider</></>');
            $this->line("  1. Ask them to chmod 644 {$logFile}");
            $this->line('  2. Most providers fix this in minutes');
            $this->newLine();

            return;
        }

        if ($returnCode === 0 && ! empty($output)) {
            foreach ($output as $line) {
                $this->colorizeLogLine($line);
            }
        } else {
            $this->warn("❌ Could not fetch laravel.log (exit code: {$returnCode})");
            $this->line('<fg=yellow>Response:</> ' . implode(' | ', $output));
            $this->newLine();
            $this->line('<fg=yellow>Attempting to debug...</></>');
            $this->line('Try running manually:');
            $this->line("  ssh -p {$sshPort} {$user}@{$host}");
            $this->line("  tail -n {$lines} {$logFile}");

            return;
        }

        $this->line('<fg=cyan>═══════════════════════════════════════════════</>');
        $this->newLine();

        // Save to local file if requested
        if ($saveLogs) {
            $this->saveLogsLocally($output, $env);
        }

        // Show summary
        $this->showLogSummary($output);

        // Cleanup SSH processes
        $this->cleanupSSH();
    }

    /**
     * Cleanup SSH processes
     */
    private function cleanupSSH(): void
    {
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            exec('taskkill /F /IM ssh.exe 2>nul', $output, $returnCode);
        } else {
            exec('pkill -f ssh 2>/dev/null', $output, $returnCode);
        }
    }

    /**
     * Display log line with color coding
     */
    private function colorizeLogLine(string $line): void
    {
        if (str_contains($line, '[ERROR]')) {
            $this->line("<fg=red>{$line}</>");
        } elseif (str_contains($line, '[WARNING]')) {
            $this->line("<fg=yellow>{$line}</>");
        } elseif (str_contains($line, '[DEBUG]')) {
            $this->line("<fg=blue>{$line}</>");
        } else {
            $this->line($line);
        }
    }

    /**
     * Save logs to local file
     */
    private function saveLogsLocally(array $logs, string $env): void
    {
        $logsDir = storage_path('remote-logs');
        if (! is_dir($logsDir)) {
            mkdir($logsDir, 0755, true);
        }

        $filename = "{$logsDir}/{$env}-laravel-" . date('Y-m-d_H-i-s') . '.log';
        file_put_contents($filename, implode("\n", $logs));

        $this->info('✓ Logs saved to: storage/remote-logs/' . basename($filename));
    }

    /**
     * Show log summary with error/warning counts
     */
    private function showLogSummary(array $logs): void
    {
        $errorCount = 0;
        $warningCount = 0;
        $debugCount = 0;

        foreach ($logs as $line) {
            if (str_contains($line, '[ERROR]')) {
                $errorCount++;
            } elseif (str_contains($line, '[WARNING]')) {
                $warningCount++;
            } elseif (str_contains($line, '[DEBUG]')) {
                $debugCount++;
            }
        }

        $this->line('<fg=cyan>Log Summary:</></>');
        if ($errorCount > 0) {
            $this->line("<fg=red>  Errors: {$errorCount}</>");
        }
        if ($warningCount > 0) {
            $this->line("<fg=yellow>  Warnings: {$warningCount}</>");
        }
        if ($debugCount > 0) {
            $this->line("<fg=blue>  Debug messages: {$debugCount}</>");
        }
        if ($errorCount === 0 && $warningCount === 0) {
            $this->info('  ✓ No errors or warnings found');
        }
    }

    /**
     * Execute commands via SSH and stream output
     */
    private function executeCommands(string $user, string $host, int $port, string $remotePath, array $selectedCommands, string $phpPath = 'php'): void
    {
        $this->info('🔄 Executing commands on remote server...');
        $this->line('<fg=cyan>═══════════════════════════════════════════════</>');
        $this->newLine();

        foreach ($selectedCommands as $cmd) {
            if (! isset(self::ALLOWED_COMMANDS[$cmd])) {
                $this->warn("Skipping unauthorized command: {$cmd}");

                continue;
            }

            $command = $this->replacePhpPath(self::ALLOWED_COMMANDS[$cmd], $phpPath);
            $this->info("▶ Running: {$cmd}");
            $this->line("<fg=gray>{$command}</>");
            $this->newLine();

            // Build full SSH command with proper escaping and security options
            $keyOption = $this->getSshKeyOption();
            $fullCommand = sprintf(
                'ssh %s-p %d -o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new %s@%s "cd %s && %s"',
                $keyOption,
                $port,
                escapeshellarg($user),
                escapeshellarg($host),
                escapeshellarg($remotePath),
                $command
            );

            // Execute and stream output
            $this->line('<fg=yellow>Output:</></>');
            passthru($fullCommand, $returnCode);
            $this->newLine();

            if ($returnCode !== 0) {
                $this->line("<fg=red>✗ Command failed with exit code: {$returnCode}</>");
            } else {
                $this->line('<fg=green>✓ Command completed successfully</>');
            }

            $this->newLine();
        }

        $this->line('<fg=cyan>═══════════════════════════════════════════════</>');
        $this->info('✅ All commands executed');

        // Cleanup SSH processes
        $this->cleanupSSH();
    }

    /**
     * Build verbose options for selection
     */
    private function buildVerboseOptions(): array
    {
        $options = [];

        // Add command options with descriptions
        foreach (self::ALLOWED_COMMANDS as $name => $cmd) {
            $options[$name] = $this->getCommandDescription($name);
        }

        // Add special options
        $options['logs'] = 'Fetch remote Laravel logs';
        $options['download-logs'] = 'Download log files to local storage/logs/remote';
        $options['clear-logs'] = 'Clear remote log files (DANGEROUS)';
        $options['check-sync'] = 'Check FTP deploy sync state on remote';
        $options['restore-sync'] = 'Restore FTP sync state from latest backup';
        $options['reset-sync'] = 'Reset FTP deploy sync state (forces full re-deployment)';
        $options['all'] = 'Execute all commands';

        return $options;
    }

    /**
     * Get description for a command
     */
    private function getCommandDescription(string $name): string
    {
        $descriptions = [
            'cache' => 'Clear all caches (cache, config, views, routes)',
            'optimize' => 'Cache config/routes/views/events for production performance',
            'fresh' => 'Reset database: drop tables, re-migrate, seed with -v flag',
            'migrate' => 'Run migrations with verbose output (-v flag)',
            'seed' => 'Seed database with verbose output (-v flag)',
            'composer' => 'Install composer dependencies (production-optimized)',
            'dump' => 'Dump composer autoloader',
            'symlink' => 'Create storage:link symlink',
            'key-generate' => 'Generate new APP_KEY for Laravel encryption (writes to .env)',
            'logs' => 'Fetch remote Laravel logs',
            'download-logs' => 'Download log files to local storage/logs/remote',
            'clear-logs' => 'Clear remote log files (DANGEROUS)',
            'check-sync' => 'View remote FTP sync state file contents',
            'restore-sync' => 'Restore FTP sync state from latest backup',
            'reset-sync' => 'Reset FTP deploy sync state for full re-deployment',
        ];

        return $descriptions[$name] ?? $name;
    }

    /**
     * Multi-select with verbose display (custom implementation)
     */
    private function multiSelectVerbose(string $question, array $options): array
    {
        $this->line("<fg=cyan>{$question}</>");
        $this->newLine();

        $selected = [];
        $keys = array_keys($options);

        foreach ($keys as $index => $key) {
            $description = $options[$key];
            $this->line('  [<fg=yellow>' . ($index + 1) . "</>] {$key}: {$description}");
        }

        $this->newLine();
        $input = $this->ask('Enter command numbers or names (comma-separated, e.g., "1,3,logs" or "fresh,logs")');

        if (empty(trim($input))) {
            return [];
        }

        $choices = array_map('trim', explode(',', $input));

        foreach ($choices as $choice) {
            // Try as number first
            if (is_numeric($choice)) {
                $index = (int) $choice - 1;
                if (isset($keys[$index])) {
                    $selected[] = $keys[$index];
                }
            } else {
                // Try as name
                if (in_array($choice, $keys)) {
                    $selected[] = $choice;
                } else {
                    $this->warn("Unknown option: {$choice}");
                }
            }
        }

        // Show selected
        if (! empty($selected)) {
            $this->newLine();
            $this->info('Selected:');
            foreach ($selected as $item) {
                $this->line("  ✓ {$item}");
            }
            $this->newLine();
        }

        return array_unique($selected);
    }

    /**
     * Validate SSH configuration is properly set
     */
    private function validateSSHConfiguration(): bool
    {
        $sshUser = env('SSH_USER');
        $sshHost = env('SSH_HOST');
        $sshPort = env('SSH_PORT');

        if (! $sshUser || ! $sshHost) {
            $this->error('❌ SSH configuration missing in .env');
            $this->line('Required variables:');
            $this->line('  SSH_USER=your_ssh_username');
            $this->line('  SSH_HOST=your_server_ip_or_domain');
            $this->line('  SSH_PORT=22 (optional, defaults to 22)');

            return false;
        }

        // Validate port is numeric
        if ($sshPort && ! is_numeric($sshPort)) {
            $this->error('❌ SSH_PORT must be numeric');

            return false;
        }

        return true;
    }

    /**
     * Validate remote path is absolute and safe
     */
    private function validateRemotePath(string $path): bool
    {
        // Must start with / (absolute path)
        if (! str_starts_with($path, '/')) {
            return false;
        }

        // Prevent path traversal attempts
        if (str_contains($path, '..')) {
            return false;
        }

        // Path should contain reasonable characters only
        if (! preg_match('/^[a-zA-Z0-9\/_.-]+$/', $path)) {
            return false;
        }

        return true;
    }

    /**
     * Check if command is allowed (whitelist validation)
     */
    private function isCommandAllowed(string $command): bool
    {
        return in_array($command, ['logs', 'download-logs', 'clear-logs', 'check-sync', 'restore-sync', 'reset-sync', 'all']) || isset(self::ALLOWED_COMMANDS[$command]);
    }

    /**
     * Log command execution for audit trail
     */
    private function logCommandExecution(string $env, array $commands): void
    {
        $logPath = storage_path('logs/remote-commands.log');
        $timestamp = now()->toDateTimeString();
        $user = get_current_user() ?? 'unknown';
        $commandsStr = implode(', ', $commands);

        $message = "[{$timestamp}] User: {$user} | Environment: {$env} | Commands: {$commandsStr}\n";

        file_put_contents($logPath, $message, FILE_APPEND);

        $this->info('📝 Execution logged: storage/logs/remote-commands.log');
    }

    /**
     * Check remote FTP deploy sync state file contents
     *
     * Downloads and displays the .ftp-deploy-sync-state.json file from remote to see
     * what directories/files are being tracked by the FTP Deploy action.
     */
    public function checkRemoteFtpSyncState(string $user = '', string $host = '', int $port = 22, string $remotePath = ''): void
    {
        // Use provided credentials or fall back to environment
        if (! $user || ! $host) {
            $user = env('SSH_USER');
            $host = env('SSH_HOST');
            $port = (int) env('SSH_PORT', 22);
        }

        if (! $remotePath) {
            $env = $this->argument('environment') ?? 'staging';
            $pathKey = 'SSH_PATH_' . strtoupper($env);
            $remotePath = env($pathKey);
        }

        if (! $user || ! $host || ! $remotePath) {
            $this->error('❌ Missing SSH credentials or remote path');

            return;
        }

        $syncStateFile = "{$remotePath}/.ftp-deploy-sync-state.json";

        $this->newLine();
        $this->info('📋 Checking remote FTP sync state file...');
        $this->line("Path: {$syncStateFile}");
        $this->newLine();

        // Download the sync state file
        $tempFile = tempnam(sys_get_temp_dir(), 'ftp-sync-');

        $downloadCmd = sprintf(
            'scp -P %d %s@%s:%s %s 2>&1',
            $port,
            escapeshellarg($user),
            escapeshellarg($host),
            escapeshellarg($syncStateFile),
            escapeshellarg($tempFile)
        );

        exec($downloadCmd, $dlOutput, $dlCode);

        if ($dlCode !== 0 || ! file_exists($tempFile)) {
            $this->error('❌ Could not download sync state file from remote');
            if (! empty($dlOutput)) {
                $this->line('Error: ' . implode(' ', $dlOutput));
            }

            return;
        }

        $content = file_get_contents($tempFile);
        $data = json_decode($content, true);

        if (! is_array($data)) {
            $this->error('❌ Sync state file is not valid JSON');

            return;
        }

        $this->info('✅ Sync state file downloaded');
        $this->newLine();

        $this->line('<fg=cyan>Tracked entries: ' . count($data) . ' items</></>');
        $this->newLine();

        // Show first 30 entries
        $displayCount = min(30, count($data));
        $this->line("Showing first {$displayCount} entries:");
        $this->line('<fg=cyan>─────────────────────────────────────────────</>');

        $index = 0;
        foreach ($data as $path => $hash) {
            if ($index++ >= 30) {
                break;
            }

            $this->line("  {$path}");
        }

        if (count($data) > 30) {
            $this->line('<fg=yellow>  ... and ' . (count($data) - 30) . ' more items</>');
        }

        $this->line('<fg=cyan>─────────────────────────────────────────────</>');
        $this->newLine();

        // Check for storage directory tracking
        $hasStorage = false;
        foreach (array_keys($data) as $path) {
            if (strpos($path, 'storage') !== false) {
                $hasStorage = true;
                break;
            }
        }

        if (! $hasStorage) {
            $this->warn('⚠️  No "storage" directory entries found in sync state');
            $this->line('This may cause FTP Deploy to fail creating the storage directory.');
            $this->line('Consider running reset-sync to rebuild the sync state.');
        }

        // Cleanup
        @unlink($tempFile);
    }

    /**
     * Restore FTP sync state from latest backup
     *
     * Uploads the most recent backup of .ftp-deploy-sync-state.json back to the remote server.
     * This allows recovering from sync state corruption without doing a full reset.
     */
    public function restoreFtpSyncStateFromBackup(string $user = '', string $host = '', int $port = 22, string $remotePath = ''): void
    {
        // Use provided credentials or fall back to environment
        if (! $user || ! $host) {
            $user = env('SSH_USER');
            $host = env('SSH_HOST');
            $port = (int) env('SSH_PORT', 22);
        }

        if (! $remotePath) {
            $env = $this->argument('environment') ?? 'staging';
            $pathKey = 'SSH_PATH_' . strtoupper($env);
            $remotePath = env($pathKey);
        }

        if (! $user || ! $host || ! $remotePath) {
            $this->error('❌ Missing SSH credentials or remote path');

            return;
        }

        // Find latest backup
        $backupDir = storage_path('backups/ftp-deploy-sync-state');
        if (! is_dir($backupDir)) {
            $this->error('❌ No backup directory found');

            return;
        }

        $backups = glob("{$backupDir}/sync-state-backup-*.json");
        if (empty($backups)) {
            $this->error('❌ No backup files found');

            return;
        }

        // Sort by name to get latest
        rsort($backups);
        $latestBackup = $backups[0];

        $this->newLine();
        $this->info('📤 Restoring FTP sync state from backup...');
        $this->line('Backup file: ' . basename($latestBackup));
        $this->line("Uploading to: {$remotePath}/.ftp-deploy-sync-state.json");
        $this->newLine();

        $remoteFile = "{$remotePath}/.ftp-deploy-sync-state.json";

        // Upload backup to remote
        $uploadCmd = sprintf(
            'scp -P %d %s %s@%s:%s 2>&1',
            $port,
            escapeshellarg($latestBackup),
            escapeshellarg($user),
            escapeshellarg($host),
            escapeshellarg($remoteFile)
        );

        exec($uploadCmd, $output, $returnCode);

        if ($returnCode === 0) {
            $this->info('✅ Sync state restored successfully');
            $this->line('File will be used for next FTP Deploy');
        } else {
            $this->error('❌ Failed to restore sync state file');
            if (! empty($output)) {
                $this->warn('Error: ' . implode(' ', $output));
            }
        }
    }

    /**
     * Reset FTP deploy sync state to force full re-deployment
     *
     * This deletes the .ftp-deploy-sync-state.json file on the remote server so the next
     * GitHub Actions deployment will sync all files instead of only changed files.
     */
    public function resetFtpSyncState(string $user = '', string $host = '', int $port = 22, string $remotePath = ''): void
    {
        // Use provided credentials or fall back to environment
        if (! $user || ! $host) {
            $user = env('SSH_USER');
            $host = env('SSH_HOST');
            $port = (int) env('SSH_PORT', 22);
        }

        if (! $remotePath) {
            // Try to determine environment from context
            $env = $this->argument('environment') ?? 'staging';
            $pathKey = 'SSH_PATH_' . strtoupper($env);
            $remotePath = env($pathKey);
        }

        if (! $user || ! $host || ! $remotePath) {
            $this->error('❌ Missing SSH credentials or remote path');

            return;
        }

        $syncStateFile = "{$remotePath}/.ftp-deploy-sync-state.json";

        $this->newLine();
        $this->info('🔄 Resetting FTP deploy sync state on remote server...');
        $this->line("Path: {$syncStateFile}");
        $this->newLine();

        // Check if file exists and create backup
        $keyOption = $this->getSshKeyOption();
        $checkCmd = sprintf(
            'ssh %s-p %d %s@%s "test -f %s && echo exists || echo notfound" 2>&1',
            $keyOption,
            $port,
            escapeshellarg($user),
            escapeshellarg($host),
            escapeshellarg($syncStateFile)
        );

        exec($checkCmd, $checkOutput, $checkCode);
        $fileExists = isset($checkOutput[0]) && strpos($checkOutput[0], 'exists') !== false;

        if (! $fileExists) {
            $this->info('ℹ️  FTP sync state file not found on remote (file will be recreated on next deploy)');

            return;
        }

        // Create local backup by downloading the remote file first
        $backupDir = storage_path('backups/ftp-deploy-sync-state');
        if (! is_dir($backupDir)) {
            mkdir($backupDir, 0755, true);
        }

        $timestamp = now()->format('Y-m-d_H-i-s');
        $backupFile = "{$backupDir}/sync-state-backup-{$timestamp}.json";

        // Download backup copy
        $scpKeyOption = env('SSH_KEY_PATH') && file_exists(env('SSH_KEY_PATH')) ? '-i ' . escapeshellarg(env('SSH_KEY_PATH')) . ' ' : '';
        $downloadCmd = sprintf(
            'scp %s-P %d %s@%s:%s %s 2>&1',
            $scpKeyOption,
            $port,
            escapeshellarg($user),
            escapeshellarg($host),
            escapeshellarg($syncStateFile),
            escapeshellarg($backupFile)
        );

        exec($downloadCmd, $dlOutput, $dlCode);

        if ($dlCode === 0 && file_exists($backupFile)) {
            $this->info("✅ Backup created: {$backupFile}");
        } else {
            $this->warn('⚠️  Warning: Could not create backup before deletion');
        }

        // Delete remote sync state file
        $deleteCmd = sprintf(
            'ssh %s-p %d %s@%s "rm -f %s" 2>&1',
            $keyOption,
            $port,
            escapeshellarg($user),
            escapeshellarg($host),
            escapeshellarg($syncStateFile)
        );

        exec($deleteCmd, $deleteOutput, $deleteCode);

        if ($deleteCode === 0) {
            $this->info('✅ FTP deploy sync state reset successfully');
            $this->line('Next GitHub Actions deployment will perform a full sync');
        } else {
            $this->error('❌ Failed to delete FTP sync state file');
            if (! empty($deleteOutput)) {
                $this->warn('Error: ' . implode(' ', $deleteOutput));
            }
        }
    }

    /**
     * Check FTP sync state file status
     *
     * Shows information about when the sync state was last updated and file size
     */
    public function checkFtpSyncState(): void
    {
        $syncStateFile = base_path('.ftp-deploy-sync-state.json');

        if (! file_exists($syncStateFile)) {
            $this->warn('⚠️  FTP sync state file not found');
            $this->line('This file is created on first deployment');

            return;
        }

        $fileSize = filesize($syncStateFile);
        $lastModified = filemtime($syncStateFile);
        $lastModifiedDate = date('Y-m-d H:i:s', $lastModified);
        $fileAge = $this->getReadableTime(time() - $lastModified);

        $this->info('📋 FTP Sync State File:');
        $this->newLine();
        $this->line("  Path: {$syncStateFile}");
        $this->line('  Size: ' . number_format($fileSize) . ' bytes');
        $this->line("  Last Updated: {$lastModifiedDate} ({$fileAge} ago)");
        $this->newLine();

        // Show content preview
        $content = json_decode(file_get_contents($syncStateFile), true);
        if (is_array($content)) {
            $this->line('  Entries tracked: ' . count($content) . ' files/directories');
        }
    }

    /**
     * Get human-readable time difference
     */
    private function getReadableTime(int $seconds): string
    {
        if ($seconds < 60) {
            return $seconds . ' second' . ($seconds !== 1 ? 's' : '');
        }

        if ($seconds < 3600) {
            $minutes = (int) ($seconds / 60);

            return $minutes . ' minute' . ($minutes !== 1 ? 's' : '');
        }

        if ($seconds < 86400) {
            $hours = (int) ($seconds / 3600);

            return $hours . ' hour' . ($hours !== 1 ? 's' : '');
        }

        $days = (int) ($seconds / 86400);

        return $days . ' day' . ($days !== 1 ? 's' : '');
    }

    /**
     * Download log file via SCP (works even with restricted permissions)
     */
    private function downloadLogViaSCP(string $user, string $host, string $logPath, string $env, int $sshPort = 22): void
    {
        $logFile = "{$logPath}/laravel.log";
        $localDir = storage_path("logs/remote/{$env}");

        // Create local directory if it doesn't exist
        if (! is_dir($localDir)) {
            mkdir($localDir, 0755, true);
        }

        $timestamp = now()->format('Y-m-d_H-i-s');
        $localFile = "{$localDir}/laravel-{$timestamp}.log";

        $this->newLine();
        $this->info('📥 Downloading log file via SCP...');
        $this->line("  From: {$user}@{$host}:{$logFile}");
        $this->line("  To: {$localFile}");
        $this->newLine();

        // Build SCP command
        $cmd = sprintf(
            'scp -P %d %s@%s:%s %s 2>&1',
            $sshPort,
            escapeshellarg($user),
            escapeshellarg($host),
            escapeshellarg($logFile),
            escapeshellarg($localFile)
        );

        exec($cmd, $output, $returnCode);

        if ($returnCode === 0 && file_exists($localFile)) {
            $fileSize = filesize($localFile);
            $this->info('✅ Log file downloaded successfully!');
            $this->line("  Location: {$localFile}");
            $this->line('  Size: ' . number_format($fileSize) . ' bytes');
            $this->newLine();
            $this->line('Preview (first 20 lines):');
            $this->line('<fg=cyan>───────────────────────────────────────</>');

            $lines = file($localFile, FILE_SKIP_EMPTY_LINES);
            $previewLines = array_slice($lines, 0, 20);

            foreach ($previewLines as $line) {
                $this->colorizeLogLine($line);
            }

            $this->line('<fg=cyan>───────────────────────────────────────</>');
            $this->newLine();
            $this->info('💡 Full log saved locally. Open in your editor for complete view.');
        } else {
            $this->error('❌ Failed to download log file via SCP');
            if (! empty($output)) {
                $this->warn('Error: ' . implode(' ', $output));
            }
            $this->newLine();
            $this->line('Make sure SCP is available on your system.');
            $this->line('On Windows, ensure SSH/SCP tools are in your PATH.');
        }
    }

    /**
     * Replace 'php' with custom PHP path in commands
     */
    private function replacePhpPath(string $command, string $phpPath): string
    {
        // Replace 'php artisan' and 'php ' at the start or after &&
        return preg_replace('/\bphp\b/', $phpPath, $command);
    }
}
