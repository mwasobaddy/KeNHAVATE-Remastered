<?php

namespace App\Http\Controllers\Configuration;

use App\Http\Controllers\Controller;
use App\Http\Requests\Configuration\StoreDirectorateRequest;
use App\Http\Requests\Configuration\UpdateDirectorateRequest;
use App\Models\Directorate;
use App\Services\Configuration\DirectorateService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class DirectorateController extends Controller
{
    public function __construct(
        private DirectorateService $directorateService,
    ) {}

    public function index(Request $request): Response
    {
        return inertia('configuration/directorates/index', [
            'directorates' => $this->directorateService->list(
                $request->get('search', ''),
                $request->only(['search']),
            ),
            'filters' => $request->only(['search']),
            'search' => $request->get('search', ''),
        ]);
    }

    public function create(): Response
    {
        return inertia('configuration/directorates/create', [
            ...$this->directorateService->getFormOptions(),
        ]);
    }

    public function store(StoreDirectorateRequest $request): RedirectResponse
    {
        $this->directorateService->create($request->validated());

        return redirect()->route('directorates.index')
            ->with('success', 'Directorate created successfully.');
    }

    public function edit(Directorate $directorate): Response
    {
        return inertia('configuration/directorates/edit', [
            'directorate' => $directorate,
            ...$this->directorateService->getFormOptions(),
        ]);
    }

    public function update(UpdateDirectorateRequest $request, Directorate $directorate): RedirectResponse
    {
        $this->directorateService->update($directorate, $request->validated());

        return redirect()->route('directorates.index')
            ->with('success', 'Directorate updated successfully.');
    }

    public function destroy(Directorate $directorate): RedirectResponse
    {
        $this->directorateService->delete($directorate);

        return redirect()->route('directorates.index')
            ->with('success', 'Directorate deleted successfully.');
    }
}
