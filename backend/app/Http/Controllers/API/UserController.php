<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of users with advanced filtering
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        // Apply filters
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->with('employee')->paginate($request->get('per_page', 15));

        return response()->json($users);
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::in(['admin', 'teacher', 'employee'])],
            'status' => ['sometimes', Rule::in(['active', 'inactive', 'suspended'])],
        ]);

        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => bcrypt($validatedData['password']),
            'role' => $validatedData['role'],
            'status' => $validatedData['status'] ?? 'active',
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user->load('employee'),
        ], 201);
    }

    /**
     * Display the specified user
     */
    public function show(User $user): JsonResponse
    {
        return response()->json($user->load('employee'));
    }

    /**
     * Update the specified user
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $validatedData = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,'.$user->id,
            'role' => ['sometimes', Rule::in(['admin', 'teacher', 'employee'])],
            'status' => ['sometimes', Rule::in(['active', 'inactive', 'suspended'])],
        ]);

        $user->update($validatedData);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user->load('employee'),
        ]);
    }

    /**
     * Remove the specified user (soft delete)
     */
    public function destroy(User $user): JsonResponse
    {
        $user->update(['status' => 'inactive']);
        $user->delete();

        return response()->json(['message' => 'User deactivated successfully']);
    }

    /**
     * Restore a previously deleted user
     *
     * @param  int  $id
     */
    public function restore($id): JsonResponse
    {
        $user = User::withTrashed()->findOrFail($id);
        $user->restore();
        $user->update(['status' => 'active']);

        return response()->json([
            'message' => 'User restored successfully',
            'user' => $user->load('employee'),
        ]);
    }
}
