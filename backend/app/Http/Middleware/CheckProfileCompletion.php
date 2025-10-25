<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckProfileCompletion
{
    /**
     * Handle an incoming request to check if user has completed their profile
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated and is an employee
        if (Auth::check()) {
            $user = Auth::user();

            // Find the employee record for this user
            $employee = $user->employee()->first(); // Assuming user has one employee

            if ($employee && ! $employee->profile_completed) {
                // If user hasn't completed profile and isn't on the complete-profile route
                if (! $request->is('api/complete-profile') && ! $request->is('api/profile-completion') && ! $request->is('logout')) {
                    // Return a response indicating user needs to complete profile
                    if ($request->expectsJson()) {
                        return response()->json([
                            'message' => 'Profile completion required',
                            'requires_profile_completion' => true,
                            'redirect_to' => '/complete-profile',
                        ], 428); // 428 Precondition Required
                    }

                    // For web requests, redirect to complete profile page
                    return redirect('/complete-profile');
                }
            }
        }

        return $next($request);
    }
}
