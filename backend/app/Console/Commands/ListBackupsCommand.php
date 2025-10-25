<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class ListBackupsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'attendance:list-backups';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'List all available backup files';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $backupDir = 'backups';

        // Create backups directory if it doesn't exist
        if (! Storage::exists($backupDir)) {
            Storage::makeDirectory($backupDir);
        }

        $files = Storage::files($backupDir);

        if (empty($files)) {
            $this->info('No backup files found.');

            return 0;
        }

        $tableData = [];
        foreach ($files as $file) {
            $filename = basename($file);
            $size = Storage::size($file);
            $lastModified = Storage::lastModified($file);

            $tableData[] = [
                $filename,
                $this->formatBytes($size),
                date('Y-m-d H:i:s', $lastModified),
            ];
        }

        $this->table(['Filename', 'Size', 'Created'], $tableData);

        return 0;
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes($size, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $size > 1024 && $i < count($units) - 1; $i++) {
            $size /= 1024;
        }

        return round($size, $precision).' '.$units[$i];
    }
}
