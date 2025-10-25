<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuditLogMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log if user is authenticated
        if (Auth::check()) {
            $user = Auth::user();
            $action = $this->determineAction($request);

            // Only log specific actions that are important
            if ($this->shouldLogAction($action, $request)) {
                try {
                    AuditLog::create([
                        'user_id' => $user->id,
                        'action' => $action,
                        'model' => $this->determineModel($request),
                        'payload' => $this->getPayload($request, $response),
                        'ip_address' => $request->ip(),
                        'user_agent' => $request->userAgent(),
                    ]);
                } catch (\Exception $e) {
                    // Silently fail if audit logging fails to avoid breaking the application
                    \Log::error('Audit logging failed: '.$e->getMessage());
                }
            }
        }

        return $response;
    }

    /**
     * Determine the action based on request method and route
     */
    private function determineAction(Request $request): string
    {
        $method = $request->method();
        $route = $request->route();

        if (! $route) {
            return 'unknown';
        }

        $action = $route->getActionMethod();
        $controller = $route->getControllerClass();

        // Extract controller name
        $controllerName = class_basename($controller);
        if ($action) {
            return $controllerName.'@'.$action;
        }

        // Fallback based on HTTP method
        switch ($method) {
            case 'POST':
                return 'create';
            case 'PUT':
            case 'PATCH':
                return 'update';
            case 'DELETE':
                return 'delete';
            case 'GET':
                return 'read';
            default:
                return strtolower($method);
        }
    }

    /**
     * Determine the model being affected
     */
    private function determineModel(Request $request): ?string
    {
        $route = $request->route();

        if (! $route) {
            return null;
        }

        $uri = $request->route()->uri();

        // Map common routes to models
        $modelMap = [
            'employees' => 'Employee',
            'attendances' => 'Attendance',
            'leave-requests' => 'LeaveRequest',
            'salaries' => 'Salary',
            'face-templates' => 'FaceTemplate',
            'payroll-approvals' => 'PayrollApproval',
        ];

        foreach ($modelMap as $routePattern => $model) {
            if (str_contains($uri, $routePattern)) {
                return $model;
            }
        }

        // Extract from route parameters if possible
        $routeParams = $request->route()->parameters();
        foreach ($routeParams as $param => $value) {
            // Check if parameter looks like a model name
            $modelClass = ucfirst($param);
            if (class_exists("App\\Models\\{$modelClass}")) {
                return $modelClass;
            }
        }

        return null;
    }

    /**
     * Get payload data for the audit log
     */
    private function getPayload(Request $request, Response $response): array
    {
        $requestInput = $request->except(['password', 'password_confirmation', 'current_password']);

        // Convert any non-serializable objects to strings
        $requestInput = $this->sanitizeInput($requestInput);

        $payload = [
            'request' => [
                'method' => $request->method(),
                'uri' => $request->getRequestUri(),
                'input' => $requestInput,
            ],
            'response' => [
                'status' => $response->getStatusCode(),
            ],
        ];

        return $payload;
    }

    /**
     * Sanitize input data to ensure it's JSON serializable
     */
    private function sanitizeInput($input): array
    {
        $sanitized = [];

        foreach ($input as $key => $value) {
            if (is_array($value)) {
                $sanitized[$key] = $this->sanitizeInput($value);
            } elseif (is_object($value)) {
                // Handle UploadedFile objects specifically
                if ($value instanceof \Illuminate\Http\UploadedFile) {
                    $sanitized[$key] = [
                        'original_name' => $value->getClientOriginalName(),
                        'mime_type' => $value->getClientMimeType(),
                        'size' => $value->getSize(),
                        'is_valid' => $value->isValid(),
                    ];
                }
                // Handle other objects that can be converted to arrays
                elseif (method_exists($value, 'toArray')) {
                    $sanitized[$key] = $this->sanitizeInput($value->toArray());
                }
                // Handle generic objects
                else {
                    $sanitized[$key] = (string) $value;
                }
            } elseif (is_resource($value)) {
                // Skip resources as they can't be serialized
                continue;
            } else {
                $sanitized[$key] = $value;
            }
        }

        return $sanitized;
    }

    /**
     * Determine if this action should be logged
     */
    private function shouldLogAction(string $action, Request $request): bool
    {
        $method = $request->method();

        // Log all create, update, delete operations
        if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            return true;
        }

        // Specific actions to log
        if (str_contains($action, 'login') || str_contains($action, 'logout')) {
            return true;
        }

        // Don't log read operations for now
        return false;
    }
}
