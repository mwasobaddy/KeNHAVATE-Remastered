<?php

namespace App\Http\Controllers\Users;

use App\Http\Controllers\Controller;
use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Models\User;
use App\Services\Users\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(
        private UserService $userService,
    ) {}

    public function index(Request $request): Response
    {
        return inertia('users/index', [
            'users' => $this->userService->getAll(
                $request->get('search', ''),
                $request->only(['search', 'role', 'date_from', 'date_to']),
            ),
            'filters' => $request->only(['search', 'role', 'date_from', 'date_to']),
            'search' => $request->get('search', ''),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('user.create');

        return inertia('users/create', $this->userService->getFormData());
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $result = $this->userService->create($request->user(), $request->validated());

        $message = "User '{$result['user']->name}' created successfully.";

        if ($result['generated_password']) {
            $message .= " Auto-generated password: {$result['generated_password']}";
        }

        return redirect()->route('users.index')
            ->with('success', $message);
    }

    public function edit(User $user): Response
    {
        $this->authorize('user.edit');

        return inertia('users/edit', [
            'user' => $this->userService->getForEdit($user),
            ...$this->userService->getFormData(),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $this->userService->update($request->user(), $user, $request->validated());

        return redirect()->route('users.index')
            ->with('success', "User '{$user->name}' updated successfully.");
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $this->authorize('user.delete');

        if ($request->user()->is($user)) {
            return back()->withErrors(['error' => 'You cannot delete your own account.']);
        }

        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $this->userService->delete($request->user(), $user);

        return redirect()->route('users.index')
            ->with('success', "User '{$user->name}' deleted successfully.");
    }
}
