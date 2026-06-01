<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\MomentImportService;
use Illuminate\Console\Command;

class ImportMoments extends Command
{
    protected $signature = 'moments:import
        {--email= : Email of the user to import moments for}
        {--file=  : Path to the moments file (relative to project root or absolute)}
        {--format=json : File format: json or csv}
        {--clear  : Clear existing moments before importing}
        {--no-history : Skip generating 6-month completion history}';

    protected $description = 'Import moments from a JSON file for a given user';

    public function __construct(public MomentImportService $importer)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $email = $this->option('email') ?? $this->ask('User email');
        $file = $this->option('file') ?? $this->ask('Path to JSON file');

        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->error("No user found with email: {$email}");

            return self::FAILURE;
        }

        // Resolve relative paths from the project root
        if (! str_starts_with($file, '/') && ! preg_match('/^[A-Z]:\\\\/i', $file)) {
            $file = base_path($file);
        }

        if (! file_exists($file)) {
            $this->error("File not found: {$file}");

            return self::FAILURE;
        }

        $clear = (bool) $this->option('clear');
        $generateHistory = ! $this->option('no-history');
        $format = strtolower($this->option('format') ?? 'json');

        if (! in_array($format, ['json', 'csv'])) {
            $this->error("Unsupported format: {$format}. Use json or csv.");

            return self::FAILURE;
        }

        if ($clear && ! $this->confirm("Clear all existing moments for {$email}?", true)) {
            $this->info('Aborted.');

            return self::SUCCESS;
        }

        $this->info("Importing moments for {$email}…");

        $count = $this->importer->import(
            user: $user,
            filePath: $file,
            format: $format,
            clearExisting: $clear,
            generateHistory: $generateHistory,
        );

        $this->info("✅  {$count} moment(s) imported for {$email}");

        return self::SUCCESS;
    }
}
