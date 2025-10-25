<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;

class BackupController extends Controller
{
    /**
     * Run backup command
     */
    public function runBackup(Request $request): JsonResponse
    {
        // Only allow admin users to perform backups
        if (! auth()->user()->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        try {
            $filename = $request->get('filename') ?? 'attendance_backup_'.date('Y-m-d_H-i-s').'.zip';

            // Run the backup command in a queue job (in a real app, you'd want to use a job)
            // For now, we'll run it directly but with a response that backup has started
            $exitCode = Artisan::call('attendance:backup', [
                '--filename' => $filename,
            ]);

            if ($exitCode !== 0) {
                return response()->json([
                    'message' => 'Backup failed',
                    'error' => Artisan::output(),
                ], 500);
            }

            // Log this action for audit
            \App\Models\AuditLog::create([
                'user_id' => auth()->id(),
                'action' => 'backup:run',
                'model' => 'Backup',
                'payload' => ['filename' => $filename],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'message' => 'Backup created successfully',
                'filename' => $filename,
                'output' => Artisan::output(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Backup failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get list of backups
     */
    public function getBackups(): JsonResponse
    {
        // Only allow admin users to view backups
        if (! auth()->user()->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $backupDir = 'backups';

        // Create backups directory if it doesn't exist
        if (! Storage::exists($backupDir)) {
            Storage::makeDirectory($backupDir);
        }

        $files = Storage::files($backupDir);
        $backups = [];

        foreach ($files as $file) {
            $filename = basename($file);
            $size = Storage::size($file);
            $lastModified = Storage::lastModified($file);

            $backups[] = [
                'filename' => $filename,
                'size' => $size,
                'size_formatted' => $this->formatBytes($size),
                'created_at' => date('Y-m-d H:i:s', $lastModified),
                'download_url' => url("storage/{$file}"), // Assuming storage is linked
            ];
        }

        // Sort by creation date (newest first)
        usort($backups, function ($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

        return response()->json([
            'data' => $backups,
        ]);
    }

    /**
     * Get a specific backup details
     */
    public function getBackup(string $filename): JsonResponse
    {
        // Only allow admin users to view backup details
        if (! auth()->user()->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $backupPath = 'backups/'.$filename;

        if (! Storage::exists($backupPath)) {
            return response()->json([
                'message' => 'Backup file not found',
            ], 404);
        }

        $size = Storage::size($backupPath);
        $lastModified = Storage::lastModified($backupPath);

        return response()->json([
            'data' => [
                'filename' => $filename,
                'size' => $size,
                'size_formatted' => $this->formatBytes($size),
                'created_at' => date('Y-m-d H:i:s', $lastModified),
                'download_url' => url("storage/backups/{$filename}"),
            ],
        ]);
    }

    /**
     * Download a backup file
     */
    public function downloadBackup(string $filename)
    {
        // Only allow admin users to download backups
        if (! auth()->user()->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $backupPath = 'backups/'.$filename;

        if (! Storage::exists($backupPath)) {
            return response()->json([
                'message' => 'Backup file not found',
            ], 404);
        }

        // Log this action for audit
        \App\Models\AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'backup:download',
            'model' => 'Backup',
            'payload' => ['filename' => $filename],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return Storage::download($backupPath, $filename);
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
