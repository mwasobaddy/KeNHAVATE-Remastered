<?php

namespace App\Http\Controllers\Api\Roles;

use App\Http\Controllers\Controller;
use App\Http\Requests\Roles\StoreRoleRequest;
use App\Http\Requests\Roles\UpdateRoleRequest;
use App\Services\Roles\RoleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function __construct(
        private RoleService $roleService,
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'roles' => $this->roleService->getAll(),
        ]);
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = $this->roleService->create(
            $request->user(),
            $request->name,
            $request->permissions ?? [],
        );

        return response()->json([
            'role' => $role->load('permissions'),
        ], 201);
    }

    public function show(Role $role): JsonResponse
    {
        return response()->json([
            'role' => $this->roleService->getForEdit($role),
            'permissions' => $this->roleService->getFormPermissions(),
        ]);
    }

    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        $name = $this->roleService->update(
            $request->user(),
            $role,
            $request->name,
            $request->permissions ?? [],
        );

        return response()->json([
            'message' => "Role '{$name}' updated successfully.",
        ]);
    }

    public function destroy(Request $request, Role $role): JsonResponse
    {
        if (! $request->user()->can('role.delete')) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($this->roleService->isProtected($role)) {
            return response()->json([
                'message' => "The '{$role->name}' role cannot be deleted.",
            ], 422);
        }

        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $this->roleService->delete($request->user(), $role);

        return response()->json([
            'message' => "Role '{$role->name}' deleted successfully.",
        ]);
    }
}
