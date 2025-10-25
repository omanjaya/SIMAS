<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class SettingsController extends Controller
{
    /**
     * Get all settings with optional filtering
     */
    public function index(Request $request): JsonResponse
    {
        $query = Setting::query();

        // Apply filters if provided
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('key', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $settings = $query->orderBy('category')->orderBy('key')->get();

        return response()->json([
            'data' => $settings,
        ]);
    }

    /**
     * Get a specific setting by key
     */
    public function show(string $key): JsonResponse
    {
        $setting = Setting::where('key', $key)->first();

        if (! $setting) {
            return response()->json([
                'message' => 'Setting not found',
            ], 404);
        }

        return response()->json([
            'data' => $setting,
        ]);
    }

    /**
     * Update or create a setting
     */
    public function update(Request $request, string $key): JsonResponse
    {
        // Only allow admin users to update settings
        if (! auth()->user()->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'value' => 'required',
            'type' => 'in:string,integer,boolean,json',
            'category' => 'string',
            'description' => 'string|nullable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Validate specific setting types and constraints
        $validatedData = $validator->validated();
        $value = $validatedData['value'];

        // Validate type-specific value if type is provided
        if (isset($validatedData['type'])) {
            switch ($validatedData['type']) {
                case 'integer':
                    $value = (int) $value;
                    break;
                case 'boolean':
                    $value = filter_var($value, FILTER_VALIDATE_BOOLEAN);
                    break;
                case 'json':
                    $decoded = json_decode($value, true);
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        return response()->json([
                            'message' => 'Invalid JSON format',
                        ], 422);
                    }
                    break;
            }
        }

        // Create or update the setting
        $setting = Setting::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'type' => $validatedData['type'] ?? 'string',
                'category' => $validatedData['category'] ?? null,
                'description' => $validatedData['description'] ?? null,
            ]
        );

        // Clear cache for this setting
        Cache::forget("setting_{$key}");

        return response()->json([
            'message' => 'Setting updated successfully',
            'data' => $setting,
        ]);
    }

    /**
     * Bulk update settings
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        // Only allow admin users to update settings
        if (! auth()->user()->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'required',
            'settings.*.type' => 'in:string,integer,boolean,json',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $settings = $validator->validated()['settings'];
        $updatedSettings = [];

        foreach ($settings as $settingData) {
            $key = $settingData['key'];
            $value = $settingData['value'];

            // Validate type-specific value if type is provided
            if (isset($settingData['type'])) {
                switch ($settingData['type']) {
                    case 'integer':
                        $value = (int) $value;
                        break;
                    case 'boolean':
                        $value = filter_var($value, FILTER_VALIDATE_BOOLEAN);
                        break;
                    case 'json':
                        $decoded = json_decode($value, true);
                        if (json_last_error() !== JSON_ERROR_NONE) {
                            return response()->json([
                                'message' => "Invalid JSON format for setting {$key}",
                            ], 422);
                        }
                        break;
                }
            }

            // Create or update the setting
            $setting = Setting::updateOrCreate(
                ['key' => $key],
                [
                    'value' => $value,
                    'type' => $settingData['type'] ?? 'string',
                    'category' => $settingData['category'] ?? null,
                    'description' => $settingData['description'] ?? null,
                ]
            );

            // Clear cache for this setting
            Cache::forget("setting_{$key}");

            $updatedSettings[] = $setting;
        }

        return response()->json([
            'message' => 'Settings updated successfully',
            'data' => $updatedSettings,
        ]);
    }
}
