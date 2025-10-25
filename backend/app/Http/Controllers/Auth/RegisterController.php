<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class RegisterController extends Controller
{
    /**
     * Store a newly created user in storage.
     * This endpoint is typically used by admins to create new users.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @throws ValidationException
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => ['required', Rule::in(['admin', 'teacher', 'employee'])],
            // Employee-specific fields (required when creating employee)
            'first_name' => 'required_if:role,teacher,employee|string|max:255',
            'last_name' => 'required_if:role,teacher,employee|string|max:255',
            'employee_code' => 'required_if:role,teacher,employee|string|max:50|unique:employees,employee_code',
            'hire_date' => 'required_if:role,teacher,employee|date',
            'employment_type' => 'required_if:role,teacher,employee|in:full-time,part-time,contract,intern',
            'department' => 'required_if:role,teacher,employee|string|max:255',
            'position' => 'required_if:role,teacher,employee|string|max:255',
        ]);

        // Create the user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        // If the role is teacher or employee, also create an employee record
        if (in_array($request->role, ['teacher', 'employee'])) {
            Employee::create([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'email' => $request->email,
                'employee_code' => $request->employee_code,
                'hire_date' => $request->hire_date ?? today(),
                'employment_type' => $request->employment_type ?? 'full-time',
                'department' => $request->department ?? 'General',
                'position' => $request->position ?? 'Staff',
                'user_id' => $user->id,
                'status' => 'active',
            ]);
        }

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user,
        ], 201);
    }
}
