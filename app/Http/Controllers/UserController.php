<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function index()
    {
        return Inertia::render('crud/user', [
            'users' => User::all()->map(function ($user) {
                return [
                    'id' => $user->id,
                    'fname' => $user->fname,
                    'mname' => $user->mname,
                    'lname' => $user->lname,
                    'email' => $user->email,
                    'contact_no' => $user->contact_no,
                    'role' => $user->role,
                ];
            })->toArray(),
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'fname' => 'required|string|max:255',
                'mname' => 'nullable|string|max:255',
                'lname' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'contact_no' => 'required|string|max:15',
                'role' => 'required|string|max:50',
            ]);

            User::create($validatedData);

            return Inertia::render('crud/user', [
                'users' => User::all()->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'fname' => $user->fname,
                        'mname' => $user->mname,
                        'lname' => $user->lname,
                        'email' => $user->email,
                        'contact_no' => $user->contact_no,
                        'role' => $user->role,
                    ];
                })->toArray(),
                'message' => 'User created successfully',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e; 
        } catch (\Exception $e) {
            Log::error('Error storing user: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Failed to create user: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, User $user)
    {
        try {
            $validatedData = $request->validate([
                'fname' => 'required|string|max:255',
                'mname' => 'nullable|string|max:255',
                'lname' => 'required|string|max:255',
                'email' => 'required|email|max:255|unique:users,email,',
                'contact_no' => 'required|string|max:15',
                'role' => 'required|string|max:50',
            ]);

            $user->update($validatedData);

            return Inertia::render('crud/user', [
                'users' => User::all()->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'fname' => $user->fname,
                        'mname' => $user->mname,
                        'lname' => $user->lname,
                        'email' => $user->email,
                        'contact_no' => $user->contact_no,
                        'role' => $user->role,
                    ];
                })->toArray(),
                'message' => 'User updated successfully',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->validator->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Error updating user: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to update user: ' . $e->getMessage()]);
        }
    }

    public function destroy(User $user)
    {
        try {
            $user->delete();

            return Inertia::render('crud/user', [
                'users' => User::all()->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'fname' => $user->fname,
                        'mname' => $user->mname,
                        'lname' => $user->lname,
                        'email' => $user->email,
                        'contact_no' => $user->contact_no,
                        'role' => $user->role,
                    ];
                })->toArray(),
                'message' => 'User deleted successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting user: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Failed to delete user: ' . $e->getMessage()]);
        }
    }
}