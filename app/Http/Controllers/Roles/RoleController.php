<?php

namespace App\Http\Controllers\Roles;

use App\Http\Controllers\Controller;
use App\Http\Requests\Roles\StoreRoleRequest;
use App\Http\Requests\Roles\UpdateRoleRequest;
use App\Services\Roles\RoleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function __construct(
        private RoleService $roleService,
    ) {}

    public function index(): Response
    {
        return inertia('roles/index', [
            'roles' => $this->roleService->getAll(),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('role.create');

        return inertia('roles/create', [
            'permissions' => $this->roleService->getFormPermissions(),
        ]);
    }

    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $role = $this->roleService->create(
            $request->user(),
            $request->name,
            $request->permissions ?? [],
        );

        return redirect()->route('roles.index')
            ->with('success', "Role '{$role->name}' created successfully.");
    }

    public function edit(Role $role): Response
    {
        $this->authorize('role.edit');

        return inertia('roles/edit', [
            'role' => $this->roleService->getForEdit($role),
            'permissions' => $this->roleService->getFormPermissions(),
        ]);
    }

    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        $name = $this->roleService->update(
            $request->user(),
            $role,
            $request->name,
            $request->permissions ?? [],
        );

        return redirect()->route('roles.index')
            ->with('success', "Role '{$name}' updated successfully.");
    }

    public function destroy(Request $request, Role $role): RedirectResponse
    {
        $this->authorize('role.delete');

        if ($this->roleService->isProtected($role)) {
            return back()->withErrors(['error' => "The '{$role->name}' role cannot be deleted."]);
        }

        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $this->roleService->delete($request->user(), $role);

        return redirect()->route('roles.index')
            ->with('success', "Role '{$role->name}' deleted successfully.");
    }
}
