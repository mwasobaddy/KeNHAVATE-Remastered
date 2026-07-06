<?php

namespace App\Http\Controllers\Api\Users;

use App\Http\Controllers\Controller;
use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Models\User;
use App\Services\Users\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(
        private UserService $userService,
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'users' => $this->userService->getAll(),
        ]);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $result = $this->userService->create($request->user(), $request->validated());

        return response()->json([
            'user' => $result['user']->load('roles', 'staff'),
            'generated_password' => $result['generated_password'],
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        if (! request()->user()->can('user.edit')) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json([
            'user' => $this->userService->getForEdit($user),
            ...$this->userService->getFormData(),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $this->userService->update($request->user(), $user, $request->validated());

        return response()->json([
            'message' => "User '{$user->name}' updated successfully.",
        ]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if (! $request->user()->can('user.delete')) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($request->user()->is($user)) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }

        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $this->userService->delete($request->user(), $user);

        return response()->json([
            'message' => "User '{$user->name}' deleted successfully.",
        ]);
    }
}
