<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BackupAttendanceCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'attendance:backup {--filename=} {--exclude-storage=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a backup of the attendance system (database and storage)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting backup process...');

        try {
            // Generate filename if not provided
            $filename = $this->option('filename') ?? 'attendance_backup_'.date('Y-m-d_H-i-s').'.zip';
            $backupPath = 'backups/'.$filename;

            // Create temporary directory for backup files
            $tempDir = storage_path('app/temp_backup_'.Str::random(10));
            if (! is_dir($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            $this->info('Creating database dump...');

            // Create database dump
            $dbDumpPath = $tempDir.'/database_dump.sql';
            $database = config('database.default');
            $connection = config("database.connections.{$database}");

            $command = '';
            switch ($connection['driver']) {
                case 'mysql':
                    $command = sprintf(
                        'mysqldump -h %s -u %s -p%s %s > %s',
                        $connection['host'],
                        $connection['username'],
                        $connection['password'],
                        $connection['database'],
                        $dbDumpPath
                    );
                    break;
                case 'pgsql':
                    $command = sprintf(
                        'pg_dump -h %s -U %s -d %s -f %s',
                        $connection['host'],
                        $connection['username'],
                        $connection['database'],
                        $dbDumpPath
                    );
                    // Set PGPASSWORD environment variable for PostgreSQL
                    putenv("PGPASSWORD={$connection['password']}");
                    break;
                case 'sqlite':
                    $command = sprintf(
                        'sqlite3 %s ".backup %s"',
                        $connection['database'],
                        $dbDumpPath
                    );
                    break;
                default:
                    $this->error("Unsupported database driver: {$connection['driver']}");

                    return 1;
            }

            $result = null;
            exec($command, $output, $result);

            if ($result !== 0) {
                $this->error('Failed to create database dump');
                $this->cleanupTempDir($tempDir);

                return 1;
            }

            $this->info('Database dump created successfully');

            // Copy storage files if not excluded
            $excludeStorage = $this->option('exclude-storage');
            if ($excludeStorage !== 'true') {
                $this->info('Copying storage files...');

                $storageDir = storage_path('app');
                $storageBackupDir = $tempDir.'/storage';

                if (! is_dir($storageBackupDir)) {
                    mkdir($storageBackupDir, 0755, true);
                }

                // Copy storage directory recursively (excluding temp files)
                $this->copyDirectory($storageDir, $storageBackupDir, ['temp_backup_', '.DS_Store', '.git']);

                $this->info('Storage files copied');
            }

            // Create zip archive
            $this->info('Creating zip archive...');

            $zipPath = storage_path('app/'.$backupPath);
            $zip = new \ZipArchive;

            if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) === true) {
                $this->addFilesToZip($zip, $tempDir);
                $zip->close();

                $this->info("Backup created successfully at: {$backupPath}");

                // Get file size
                $size = Storage::size($backupPath);
                $this->info('Backup size: '.$this->formatBytes($size));
            } else {
                $this->error('Failed to create zip archive');
                $this->cleanupTempDir($tempDir);

                return 1;
            }

            // Clean up temporary directory
            $this->cleanupTempDir($tempDir);

            $this->info('Backup process completed successfully!');

        } catch (\Exception $e) {
            $this->error('Backup failed: '.$e->getMessage());

            return 1;
        }

        return 0;
    }

    /**
     * Copy directory contents recursively, excluding specified patterns
     */
    private function copyDirectory($src, $dst, $excludePatterns = [])
    {
        $dir = opendir($src);
        @mkdir($dst);

        while (($file = readdir($dir)) !== false) {
            if ($file === '.' || $file === '..') {
                continue;
            }

            // Check if file matches exclude patterns
            $shouldExclude = false;
            foreach ($excludePatterns as $pattern) {
                if (strpos($file, $pattern) !== false) {
                    $shouldExclude = true;
                    break;
                }
            }

            if ($shouldExclude) {
                continue;
            }

            if (is_dir($src.'/'.$file)) {
                $this->copyDirectory($src.'/'.$file, $dst.'/'.$file, $excludePatterns);
            } else {
                copy($src.'/'.$file, $dst.'/'.$file);
            }
        }

        closedir($dir);
    }

    /**
     * Add files to zip archive recursively
     */
    private function addFilesToZip($zip, $directory, $basePath = '')
    {
        $files = scandir($directory);

        foreach ($files as $file) {
            if ($file === '.' || $file === '..') {
                continue;
            }

            $path = $directory.'/'.$file;
            $zipPath = $basePath.$file;

            if (is_file($path)) {
                $zip->addFile($path, $zipPath);
            } elseif (is_dir($path)) {
                $zip->addEmptyDir($zipPath);
                $this->addFilesToZip($zip, $path, $zipPath.'/');
            }
        }
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

    /**
     * Clean up temporary directory
     */
    private function cleanupTempDir($tempDir)
    {
        if (is_dir($tempDir)) {
            $this->deleteDirectory($tempDir);
        }
    }

    /**
     * Recursively delete directory
     */
    private function deleteDirectory($dir)
    {
        if (! is_dir($dir)) {
            return;
        }

        $files = array_diff(scandir($dir), ['.', '..']);

        foreach ($files as $file) {
            $path = $dir.'/'.$file;
            if (is_dir($path)) {
                $this->deleteDirectory($path);
            } else {
                unlink($path);
            }
        }

        rmdir($dir);
    }
}
