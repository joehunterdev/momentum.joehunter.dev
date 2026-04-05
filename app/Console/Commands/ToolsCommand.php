<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ToolsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tools {tool?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Developer tools menu - port management, bookmarks, versioning';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tool = $this->argument('tool');

        // If no tool specified, show menu
        if (! $tool) {
            return $this->showMenu();
        }

        // Execute specific tool
        return match ($tool) {
            'port-kill', 'port' => $this->portKill(),
            'bookmarks', 'bm' => $this->generateBookmarks(),
            'tag', 'ver' => $this->versionTagger(),
            'optimize', 'opt', 'clear' => $this->optimizeSystem(),
            'env-example', 'env' => $this->generateEnvExample(),
            'sftp-config', 'sftp' => $this->generateSftpConfig(),
            default => $this->error("Unknown tool: {$tool}. Run 'php artisan tools' to see available tools."),
        };
    }

    protected function showMenu(): void
    {
        $this->info('🛠️  DEVELOPER TOOLS');
        $this->info('═══════════════════════════════════════');
        $this->newLine();

        $choice = $this->choice(
            'Select a tool to run:',
            [
                '1' => '🔌 Port Kill - Kill Node/Vite processes and restart dev server',
                '2' => '🔗 Bookmarks - Generate Chrome bookmarks from Laravel routes',
                '3' => '🏷️  Version Tagger - Analyze TODO.md and create version tags',
                '4' => '⚡ Optimize - Clear all caches and optimize Laravel/Git/VS Code',
                '5' => '📝 .env.example Generator - Create .env.example from .env with masked secrets',
                '6' => '🔌 SFTP Config - Generate .vscode/sftp.json from .env credentials',
                '0' => '❌ Exit',
            ],
            '0'
        );

        match ($choice) {
            '1' => $this->portKill(),
            '2' => $this->generateBookmarks(),
            '3' => $this->versionTagger(),
            '4' => $this->optimizeSystem(),
            '5' => $this->generateEnvExample(),
            '6' => $this->generateSftpConfig(),
            default => $this->info('Goodbye! 👋'),
        };
    }

    protected function portKill(): int
    {
        $this->info('🧹 Killing stray Node processes...');
        $this->newLine();

        try {
            if (PHP_OS_FAMILY === 'Windows') {
                $output = shell_exec('taskkill /F /IM node.exe 2>&1');
                if ($output && ! str_contains($output, 'not found')) {
                    $this->line($output);
                } else {
                    $this->info('ℹ️  No existing Node processes found');
                }
            } else {
                $output = shell_exec('pkill -f "node|vite" 2>&1');
                if ($output && ! str_contains($output, 'No matching processes')) {
                    $this->line($output);
                } else {
                    $this->info('ℹ️  No existing Node processes found');
                }
            }

            $this->newLine();
            $this->info('✅ Port cleared');

            if ($this->confirm('Start fresh dev server now?', true)) {
                $this->info('📦 Starting fresh dev server...');
                $this->newLine();
                passthru('npm run dev');
            }

            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Error: ' . $e->getMessage());

            return 1;
        }
    }

    protected function generateBookmarks(): int
    {
        $this->info('🔗 GENERATING ROUTE-BASED BOOKMARKS');
        $this->info('═══════════════════════════════════════');
        $this->newLine();

        try {
            $generator = new \App\Services\BookmarkGenerator(base_path());
            $bookmarks = $generator->generate();

            $this->info('✅ Bookmarks generated successfully!');
            $this->newLine();
            $this->table(
                ['Environment', 'Routes', 'Output'],
                $bookmarks['summary']
            );

            $this->newLine();
            $this->info('📁 Files created:');
            foreach ($bookmarks['files'] as $file) {
                $this->line("   • {$file}");
            }

            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Error: ' . $e->getMessage());

            return 1;
        }
    }

    protected function versionTagger(): int
    {
        $this->info('🏷️  VERSION TAGGER');
        $this->info('═══════════════════════════════════════');
        $this->newLine();

        $todoFile = base_path('TODO.md');

        if (! file_exists($todoFile)) {
            $this->error("TODO.md file not found at: {$todoFile}");

            return 1;
        }

        $content = file_get_contents($todoFile);
        $stats = $this->analyzeTodoFile($content);

        // Get latest git version and TODO count from last tag
        $gitData = $this->getLatestGitVersion();
        $todoVersion = $this->calculateVersion($stats);

        // Aggregate TODO version to git version
        if ($gitData) {
            $version = $this->aggregateVersions($gitData, $stats['completed']);
            $stats['latest_git_version'] = $gitData['version'];
            $stats['last_tag_todos'] = $gitData['completed_todos'];
            $stats['todo_difference'] = $stats['completed'] - $gitData['completed_todos'];
            $stats['aggregated_version'] = $version;
        } else {
            $version = $todoVersion;
            $stats['aggregated_version'] = $version;
        }

        $this->displayTodoStats($stats);

        if ($gitData) {
            $this->info("📌 Latest git tag: v{$gitData['version']} (had {$gitData['completed_todos']} completed TODOs)");
            $this->info("📝 Current TODOs: {$stats['completed']} completed");
            $this->info("➕ Difference: {$stats['todo_difference']} new TODOs");
            $this->info("🎯 New version: v{$version}");
        } else {
            $this->warn("⚠️  No git tags found. Using TODO-based version: v{$version}");
        }
        $this->newLine();

        if (! $this->confirm('Create/update this version tag with TODO stats?', false)) {
            $this->info('Tag operation cancelled.');

            return 0;
        }

        // Check if tag exists
        $existingTags = shell_exec('git tag -l') ?? '';
        if (str_contains($existingTags, "v{$version}")) {
            $this->warn("Tag 'v{$version}' already exists.");
            $this->info("Updating annotation with current TODO stats...");

            // Delete existing tag locally
            shell_exec('git tag -d ' . escapeshellarg("v{$version}") . ' 2>&1');

            if ($this->confirm('Also delete from remote before recreating?', false)) {
                shell_exec('git push origin :refs/tags/' . escapeshellarg("v{$version}") . ' 2>&1');
            }
        }

        // Create tag with TODO stats
        $tagMessage = "Version v{$version}: {$stats['completed']}/{$stats['total']} TODOs completed ({$stats['completion_percentage']}%)";
        $command = 'git tag -a ' . escapeshellarg("v{$version}") . ' -m ' . escapeshellarg($tagMessage);

        shell_exec($command . ' 2>&1');
        $this->info("✅ Tag 'v{$version}' created successfully!");
        $this->info("📊 TODO stats aggregated: {$stats['completed']}/{$stats['total']} completed");

        if ($this->confirm('Push tag to remote?', false)) {
            shell_exec('git push origin ' . escapeshellarg("v{$version}"));
            $this->info("✅ Tag 'v{$version}' pushed to remote!");
        }

        return 0;
    }

    protected function getLatestGitVersion(): ?array
    {
        // Get all tags sorted by version (highest first)
        $tags = shell_exec('git tag -l --sort=-v:refname') ?? '';
        $tags = array_filter(explode("\n", trim($tags)));

        if (empty($tags)) {
            return null;
        }

        $latestTag = $tags[0];
        $version = ltrim($latestTag, 'v');

        // Get the tag annotation to extract the TODO count
        $annotation = shell_exec('git tag -l -n99 ' . escapeshellarg($latestTag)) ?? '';
        $todoCount = 0;

        // Parse annotation like "v8.23.25 Version v8.23.25: 118/131 TODOs completed (90.08%)"
        if (preg_match('/(\d+)\/\d+\s+TODOs?\s+completed/i', $annotation, $matches)) {
            $todoCount = (int)$matches[1];
        }

        return [
            'version' => $version,
            'completed_todos' => $todoCount,
        ];
    }

    protected function aggregateVersions(array $gitData, int $currentCompleted): string
    {
        [$major, $minor, $patch] = explode('.', $gitData['version']);

        // Calculate the difference in completed TODOs
        $todoDifference = $currentCompleted - $gitData['completed_todos'];

        // Add the difference to the patch number
        $newPatch = (int)$patch + $todoDifference;

        return "{$major}.{$minor}.{$newPatch}";
    }

    protected function analyzeTodoFile(string $content): array
    {
        $completed = preg_match_all('/\[x\]/i', $content);
        $incomplete = preg_match_all('/\[\s\]/', $content);
        $total = $completed + $incomplete;

        $currentVersion = '3.8.1';
        if (preg_match('/# Version (\d+\.\d+\.\d+)/', $content, $matches)) {
            $currentVersion = $matches[1];
        }

        $completionPercentage = $total > 0 ? round(($completed / $total) * 100, 2) : 0;

        return [
            'completed' => $completed,
            'incomplete' => $incomplete,
            'total' => $total,
            'completion_percentage' => $completionPercentage,
            'current_version' => $currentVersion,
        ];
    }

    protected function calculateVersion(array $stats): string
    {
        $completedCount = $stats['completed'];
        $hundreds = intval($completedCount / 100);
        $tens = intval(($completedCount % 100) / 10);
        $ones = $completedCount % 10;

        return "{$hundreds}.{$tens}.{$ones}";
    }

    protected function incrementVersion(string $version): string
    {
        [$major, $minor, $patch] = explode('.', $version);

        return $major . '.' . $minor . '.' . ($patch + 1);
    }

    protected function displayTodoStats(array $stats): void
    {
        $rows = [
            ['Completed tasks', $stats['completed'] . ' ✅'],
            ['Incomplete tasks', $stats['incomplete'] . ' ⏳'],
            ['Total tasks', $stats['total'] . ' 📝'],
            ['Completion', $stats['completion_percentage'] . '% 📈'],
        ];

        if (isset($stats['latest_git_version']) && $stats['latest_git_version']) {
            $rows[] = ['Latest git version', 'v' . $stats['latest_git_version'] . ' 🏷️'];
            $rows[] = ['TODO-based version', 'v' . $this->calculateVersion($stats) . ' 📝'];
            $rows[] = ['Aggregated version', 'v' . $stats['aggregated_version'] . ' 🎯'];
        } else {
            $rows[] = ['TODO-based version', 'v' . $this->calculateVersion($stats) . ' 🎯'];
        }

        $this->table(['Metric', 'Value'], $rows);
        $this->newLine();
    }

    protected function optimizeSystem(): int
    {
        $this->info('⚡ SYSTEM OPTIMIZATION & CACHE CLEARING');
        $this->info('═══════════════════════════════════════');
        $this->newLine();

        $this->info('🚀 Starting optimization...');
        $this->newLine();

        $results = [];

        try {
            // Laravel Cache Clear
            $this->info('→ Clearing Laravel cache...');
            $this->call('cache:clear');
            $results[] = ['✅', 'Laravel Cache', 'Cleared'];

            // Laravel Config Clear
            $this->info('→ Clearing config cache...');
            $this->call('config:clear');
            $results[] = ['✅', 'Laravel Config', 'Cleared'];

            // Laravel Routes Clear
            $this->info('→ Clearing route cache...');
            $this->call('route:clear');
            $results[] = ['✅', 'Laravel Routes', 'Cleared'];

            // Laravel Views Clear
            $this->info('→ Clearing compiled views...');
            $this->call('view:clear');
            $results[] = ['✅', 'Laravel Views', 'Cleared'];

            // Laravel Events Clear
            $this->info('→ Clearing cached events...');
            $this->call('event:clear');
            $results[] = ['✅', 'Laravel Events', 'Cleared'];

            // Clear Laravel Logs
            $this->info('→ Clearing Laravel logs...');
            $logPath = storage_path('logs');
            $logFiles = glob($logPath . '/*.log');
            $clearedCount = 0;
            foreach ($logFiles as $logFile) {
                if (file_exists($logFile)) {
                    file_put_contents($logFile, '');
                    $clearedCount++;
                }
            }
            $results[] = ['✅', 'Laravel Logs', "Cleared {$clearedCount} file(s)"];

            // Optimize Autoloader
            $this->info('→ Optimizing Composer autoloader...');
            exec('composer dump-autoload -o 2>&1', $output, $returnCode);
            if ($returnCode === 0) {
                $results[] = ['✅', 'Composer Autoloader', 'Optimized'];
            } else {
                $results[] = ['⚠️', 'Composer Autoloader', 'Failed'];
            }

            // Git Garbage Collection
            $this->info('→ Running git garbage collection...');
            exec('git gc --auto 2>&1', $output, $returnCode);
            if ($returnCode === 0) {
                $results[] = ['✅', 'Git Garbage Collection', 'Completed'];
            } else {
                $results[] = ['⚠️', 'Git Garbage Collection', 'Skipped'];
            }

            // Git Prune
            $this->info('→ Pruning unreachable git objects...');
            exec('git prune 2>&1', $output, $returnCode);
            if ($returnCode === 0) {
                $results[] = ['✅', 'Git Prune', 'Completed'];
            } else {
                $results[] = ['⚠️', 'Git Prune', 'Skipped'];
            }

            $this->newLine();
            $this->info('📊 OPTIMIZATION SUMMARY');
            $this->table(['Status', 'Operation', 'Result'], $results);

            $this->newLine();
            $this->info('💡 ADDITIONAL TIPS:');
            $this->line('   • VS Code: Run "Developer: Reload Window" (Ctrl+R) to refresh');
            $this->line('   • VS Code: Check "Output" panel for extension errors');
            $this->line('   • Git: Run "git fsck" to verify repository integrity');
            $this->line('   • Laravel: Run "php artisan optimize" to cache config/routes/views');
            $this->newLine();

            if ($this->confirm('Run Laravel optimization now (cache config/routes)?', false)) {
                $this->newLine();
                $this->info('🔥 Caching configurations for production...');

                $this->info('→ Caching config...');
                $this->call('config:cache');

                $this->info('→ Caching routes...');
                $this->call('route:cache');

                $this->info('→ Caching views...');
                $this->call('view:cache');

                $this->newLine();
                $this->info('✅ Laravel optimizations cached!');
                $this->warn('⚠️  Remember to clear caches when making config/route changes in development');
            }

            $this->newLine();
            $this->info('✨ All optimizations completed successfully!');

            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Error during optimization: ' . $e->getMessage());
            return 1;
        }
    }

    protected function generateEnvExample(): int
    {
        $this->info('📝 Generating .env.example from .env...');
        $this->newLine();

        try {
            $basePath = base_path();
            $envPath = "{$basePath}/.env";

            if (! file_exists($envPath)) {
                $this->error('✗ .env file not found');
                return 1;
            }

            // Pattern-based rules for handling sensitive data
            $patterns = [
                '_KEY' => 'mask',
                '_SECRET' => 'mask',
                '_PASSWORD' => 'mask',
                '_USERNAME' => 'mask',
                '_TOKEN' => 'mask',
                '_DATABASE' => 'mask',
                '_FIRST_NAME' => 'mask',
                '_LAST_NAME' => 'mask',
                '_EMAIL' => 'mask',
                'STRIPE_SANDBOX_ACC' => 'mask',
                'STRIPE_ACC' => 'mask',
                'STRIPE_SANDBOX_TEST_USER_ID' => 'mask',
            ];

            // Prefixes to skip entirely
            $skipPrefixes = ['SSH_', 'SFTP_', 'PATH_STAGING', 'PATH_PRODUCTION'];

            // Read original file to preserve structure
            $lines = file($envPath, FILE_IGNORE_NEW_LINES);
            $output = [];

            foreach ($lines as $line) {
                $trimmed = trim($line);

                // Preserve blank lines
                if (empty($trimmed)) {
                    $output[] = $line;
                    continue;
                }

                // Handle comments - check if they contain sensitive patterns or SSH commands
                if (str_starts_with($trimmed, '#')) {
                    // Skip SSH/deployment command comments
                    if (preg_match('/ssh|sftp|u\d+@|\/home\/u\d+/i', $line)) {
                        continue;
                    }

                    // If it's a commented-out KEY=VALUE line, check if key should be masked
                    if (str_contains($line, '=')) {
                        $commentContent = ltrim($trimmed, '# ');
                        if (str_contains($commentContent, '=')) {
                            [$key, $value] = explode('=', $commentContent, 2);
                            $key = trim($key);

                            // Check if this commented key contains sensitive patterns
                            $shouldMask = false;
                            foreach ($patterns as $pattern => $rule) {
                                if (str_contains($key, $pattern)) {
                                    $shouldMask = true;
                                    break;
                                }
                            }

                            // If sensitive, mask the value in the comment
                            if ($shouldMask) {
                                $prefix = str_replace($commentContent, '', $line);
                                $output[] = "{$prefix}{$key}=";
                                continue;
                            }
                        }
                    }

                    // Otherwise preserve the comment as-is
                    $output[] = $line;
                    continue;
                }

                // Parse KEY=VALUE
                if (str_contains($line, '=')) {
                    [$key, $rawValue] = explode('=', $line, 2);
                    $key = trim($key);

                    // Skip SSH_ and other sensitive prefixes entirely
                    $shouldSkip = false;
                    foreach ($skipPrefixes as $prefix) {
                        if (str_starts_with($key, $prefix)) {
                            $shouldSkip = true;
                            break;
                        }
                    }

                    if ($shouldSkip) {
                        continue;
                    }
                    $value = trim($rawValue, '\"\' ');

                    // Check key against patterns
                    $shouldMask = false;
                    foreach ($patterns as $pattern => $rule) {
                        if (str_contains($key, $pattern)) {
                            $shouldMask = true;
                            break;
                        }
                    }

                    // Special case: mask any _HOST if it's not localhost
                    if (! $shouldMask && str_contains($key, '_HOST')) {
                        $localhosts = ['localhost', '127.0.0.1', '::1', '0.0.0.0'];
                        if (! in_array($value, $localhosts)) {
                            $shouldMask = true;
                        }
                    }

                    // Output: mask if needed, otherwise keep the original value
                    if ($shouldMask) {
                        $output[] = "{$key}=";
                    } else {
                        $output[] = "{$key}={$rawValue}";
                    }

                    continue;
                }

                // Keep any other lines as-is
                $output[] = $line;
            }

            // Write to .env.example
            $examplePath = "{$basePath}/.env.example";
            $content = implode("\n", $output);
            file_put_contents($examplePath, $content . "\n");

            $this->newLine();
            $this->info('✓ Generated .env.example');
            $this->info('✓ Preserved structure (comments, spacing)');
            $this->info('✓ Masked sensitive data (passwords, keys, emails, names)');
            $this->info('✓ Kept safe config values');
            $this->newLine();

            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Error generating .env.example: ' . $e->getMessage());
            return 1;
        }
    }

    protected function generateSftpConfig(): int
    {
        $this->info('🔌 SFTP CONFIG GENERATOR');
        $this->info('═══════════════════════════════════════');
        $this->newLine();
        $this->line('Requires the <href=https://marketplace.visualstudio.com/items?itemName=Natizyskunk.sftp>Natizyskunk.sftp</> VS Code extension.');
        $this->newLine();

        try {
            $envPath = base_path('.env');

            if (! file_exists($envPath)) {
                $this->error('❌ .env file not found');
                return 1;
            }

            // Parse .env
            $envVars = [];
            foreach (file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                $line = trim($line);
                if ($line === '' || str_starts_with($line, '#')) {
                    continue;
                }
                if (str_contains($line, '=')) {
                    [$key, $value] = explode('=', $line, 2);
                    $envVars[trim($key)] = trim($value, '"\' ');
                }
            }

            // Validate required vars
            $required = ['SFTP_HOST', 'SFTP_USERNAME', 'SFTP_PASSWORD'];
            $missing = array_filter($required, fn($v) => empty($envVars[$v]));

            if (! empty($missing)) {
                $this->error('❌ Missing required .env variables: ' . implode(', ', $missing));
                $this->newLine();
                $this->line('Add the following to your .env file:');
                $this->line('  SFTP_HOST=');
                $this->line('  SFTP_USERNAME=');
                $this->line('  SFTP_PASSWORD=');
                $this->line('  SFTP_PROTOCOL=ftp');
                $this->line('  SFTP_PORT=21');
                $this->line('  SFTP_REMOTE_PATH=/');
                return 1;
            }

            // Build config
            $sftpConfig = [
                'name' => config('app.name', 'momentum.joehunter.dev'),
                'host' => $envVars['SFTP_HOST'],
                'protocol' => $envVars['SFTP_PROTOCOL'] ?? 'ftp',
                'port' => (int) ($envVars['SFTP_PORT'] ?? 21),
                'username' => $envVars['SFTP_USERNAME'],
                'remotePath' => $envVars['SFTP_REMOTE_PATH'] ?? '/',
                'password' => $envVars['SFTP_PASSWORD'],
                'uploadOnSave' => false,
                'passive' => filter_var($envVars['SFTP_PASSIVE'] ?? 'false', FILTER_VALIDATE_BOOLEAN),
            ];

            // Ensure .vscode directory exists
            $vscodePath = base_path('.vscode');
            if (! is_dir($vscodePath)) {
                mkdir($vscodePath, 0755, true);
            }

            $outputPath = $vscodePath . '/sftp.json';
            file_put_contents($outputPath, json_encode($sftpConfig, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n");

            $this->info('✅ .vscode/sftp.json generated successfully!');
            $this->line("   Host:     {$sftpConfig['host']}");
            $this->line("   Protocol: {$sftpConfig['protocol']}:{$sftpConfig['port']}");
            $this->line("   User:     {$sftpConfig['username']}");
            $this->line("   Path:     {$sftpConfig['remotePath']}");
            $this->newLine();
            $this->warn('🔒 sftp.json is gitignored — regenerate after cloning');

            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Error generating sftp.json: ' . $e->getMessage());
            return 1;
        }
    }
}
