<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (! $request->user()) {
            return response()->json(['message' => 'Authentication required'], 401);
        }

        // Debug: Log user information
        // \Log::info('RoleMiddleware check:', [
        //     'user_id' => $request->user()->id,
        //     'user_role' => $request->user()->role,
        //     'required_roles' => $roles
        // ]);

        foreach ($roles as $role) {
            if ($request->user()->role === $role) {
                return $next($request);
            }
        }

        // Debug: Log rejection reason
        // \Log::info('RoleMiddleware rejection:', [
        //     'user_role' => $request->user()->role,
        //     'required_roles' => $roles
        // ]);

        return response()->json(['message' => 'Unauthorized'], 403);
    }
}
