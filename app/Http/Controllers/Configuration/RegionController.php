<?php

namespace App\Http\Controllers\Configuration;

use App\Http\Controllers\Controller;
use App\Http\Requests\Configuration\StoreRegionRequest;
use App\Http\Requests\Configuration\UpdateRegionRequest;
use App\Models\Region;
use App\Services\Configuration\RegionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class RegionController extends Controller
{
    public function __construct(
        private RegionService $regionService,
    ) {}

    public function index(Request $request): Response
    {
        return inertia('configuration/regions/index', [
            'regions' => $this->regionService->list(
                $request->get('search', ''),
                $request->only(['search']),
            ),
            'filters' => $request->only(['search']),
            'search' => $request->get('search', ''),
        ]);
    }

    public function create(): Response
    {
        return inertia('configuration/regions/create');
    }

    public function store(StoreRegionRequest $request): RedirectResponse
    {
        $this->regionService->create($request->validated());

        return redirect()->route('regions.index')
            ->with('success', 'Region created successfully.');
    }

    public function edit(Region $region): Response
    {
        return inertia('configuration/regions/edit', [
            'region' => $region,
        ]);
    }

    public function update(UpdateRegionRequest $request, Region $region): RedirectResponse
    {
        $this->regionService->update($region, $request->validated());

        return redirect()->route('regions.index')
            ->with('success', 'Region updated successfully.');
    }

    public function destroy(Region $region): RedirectResponse
    {
        $this->regionService->delete($region);

        return redirect()->route('regions.index')
            ->with('success', 'Region deleted successfully.');
    }
}
