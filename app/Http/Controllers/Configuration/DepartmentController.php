<?php

namespace App\Http\Controllers\Configuration;

use App\Http\Controllers\Controller;
use App\Http\Requests\Configuration\StoreDepartmentRequest;
use App\Http\Requests\Configuration\UpdateDepartmentRequest;
use App\Models\Department;
use App\Services\Configuration\DepartmentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class DepartmentController extends Controller
{
    public function __construct(
        private DepartmentService $departmentService,
    ) {}

    public function index(Request $request): Response
    {
        return inertia('configuration/departments/index', [
            'departments' => $this->departmentService->list(
                $request->get('search', ''),
                $request->only(['search']),
            ),
            'filters' => $request->only(['search']),
            'search' => $request->get('search', ''),
        ]);
    }

    public function create(): Response
    {
        return inertia('configuration/departments/create', [
            ...$this->departmentService->getFormOptions(),
        ]);
    }

    public function store(StoreDepartmentRequest $request): RedirectResponse
    {
        $this->departmentService->create($request->validated());

        return redirect()->route('departments.index')
            ->with('success', 'Department created successfully.');
    }

    public function edit(Department $department): Response
    {
        return inertia('configuration/departments/edit', [
            'department' => $department,
            ...$this->departmentService->getFormOptions(),
        ]);
    }

    public function update(UpdateDepartmentRequest $request, Department $department): RedirectResponse
    {
        $this->departmentService->update($department, $request->validated());

        return redirect()->route('departments.index')
            ->with('success', 'Department updated successfully.');
    }

    public function destroy(Department $department): RedirectResponse
    {
        $this->departmentService->delete($department);

        return redirect()->route('departments.index')
            ->with('success', 'Department deleted successfully.');
    }
}
