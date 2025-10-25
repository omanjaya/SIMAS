<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;

class RestoreAttendanceCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'attendance:restore {filename}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Restore the attendance system from a backup file';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $filename = $this->argument('filename');
        $backupPath = 'backups/'.$filename;

        // Check if backup file exists
        if (! Storage::exists($backupPath)) {
            $this->error("Backup file does not exist: {$backupPath}");

            return 1;
        }

        $this->info("Starting restore process from: {$backupPath}");

        try {
            // Create temporary directory for extraction
            $tempDir = storage_path('app/temp_restore_'.uniqid());
            if (! is_dir($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            // Extract zip file
            $this->info('Extracting backup file...');
            $zipPath = storage_path('app/'.$backupPath);

            $zip = new \ZipArchive;
            if ($zip->open($zipPath) === true) {
                $zip->extractTo($tempDir);
                $zip->close();

                $this->info('Backup extracted successfully');
            } else {
                $this->error('Failed to extract backup file');
                $this->cleanupTempDir($tempDir);

                return 1;
            }

            // Restore database
            $dbDumpPath = $tempDir.'/database_dump.sql';
            if (file_exists($dbDumpPath)) {
                $this->info('Restoring database...');

                $database = config('database.default');
                $connection = config("database.connections.{$database}");

                $command = '';
                switch ($connection['driver']) {
                    case 'mysql':
                        $command = sprintf(
                            'mysql -h %s -u %s -p%s %s < %s',
                            $connection['host'],
                            $connection['username'],
                            $connection['password'],
                            $connection['database'],
                            $dbDumpPath
                        );
                        break;
                    case 'pgsql':
                        $command = sprintf(
                            'psql -h %s -U %s -d %s -f %s',
                            $connection['host'],
                            $connection['username'],
                            $connection['database'],
                            $dbDumpPath
                        );
                        // Set PGPASSWORD environment variable for PostgreSQL
                        putenv("PGPASSWORD={$connection['password']}");
                        break;
                    case 'sqlite':
                        // For SQLite, we can copy the database file directly
                        $this->info('Restoring SQLite database...');
                        $sqlitePath = $dbDumpPath; // This would be the SQLite DB file
                        copy($sqlitePath, $connection['database']);
                        break;
                    default:
                        $this->error("Unsupported database driver: {$connection['driver']}");
                        $this->cleanupTempDir($tempDir);

                        return 1;
                }

                if ($connection['driver'] !== 'sqlite') { // Skip for SQLite as handled above
                    $result = null;
                    exec($command, $output, $result);

                    if ($result !== 0) {
                        $this->error('Failed to restore database');
                        $this->cleanupTempDir($tempDir);

                        return 1;
                    }
                }

                $this->info('Database restored successfully');
            } else {
                $this->warn('No database dump found in backup, skipping database restore');
            }

            // Restore storage files
            $storageBackupDir = $tempDir.'/storage';
            if (is_dir($storageBackupDir)) {
                $this->info('Restoring storage files...');

                // Clear current storage app directory (except for the backups directory)
                $storageDir = storage_path('app');
                $this->clearStorageExceptBackups($storageDir);

                // Copy extracted storage files back to storage
                $this->copyDirectory($storageBackupDir, $storageDir);

                $this->info('Storage files restored');
            } else {
                $this->warn('No storage files found in backup, skipping storage restore');
            }

            // Clean up temporary directory
            $this->cleanupTempDir($tempDir);

            $this->info('Restore process completed successfully!');

            // Clear cache and config
            Artisan::call('config:clear');
            Artisan::call('cache:clear');
            Artisan::call('route:clear');
            Artisan::call('view:clear');

            $this->info('Cache and config cleared');

        } catch (\Exception $e) {
            $this->error('Restore failed: '.$e->getMessage());

            return 1;
        }

        return 0;
    }

    /**
     * Copy directory contents recursively
     */
    private function copyDirectory($src, $dst)
    {
        $dir = opendir($src);
        @mkdir($dst);

        while (($file = readdir($dir)) !== false) {
            if ($file === '.' || $file === '..') {
                continue;
            }

            if (is_dir($src.'/'.$file)) {
                $this->copyDirectory($src.'/'.$file, $dst.'/'.$file);
            } else {
                copy($src.'/'.$file, $dst.'/'.$file);
            }
        }

        closedir($dir);
    }

    /**
     * Clear storage directory except for backups
     */
    private function clearStorageExceptBackups($storageDir)
    {
        $items = scandir($storageDir);

        foreach ($items as $item) {
            if ($item === '.' || $item === '..' || $item === 'backups') {
                continue;
            }

            $path = $storageDir.'/'.$item;

            if (is_dir($path)) {
                $this->deleteDirectory($path);
            } else {
                unlink($path);
            }
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

    /**
     * Clean up temporary directory
     */
    private function cleanupTempDir($tempDir)
    {
        if (is_dir($tempDir)) {
            $this->deleteDirectory($tempDir);
        }
    }
}
