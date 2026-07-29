<?php

namespace App\Http\Controllers\Configuration;

use App\Http\Controllers\Controller;
use App\Http\Requests\Points\StorePointRequest;
use App\Http\Requests\Points\UpdatePointRequest;
use App\Models\Point;
use App\Services\Points\PointService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class PointController extends Controller
{
    public function __construct(
        private PointService $pointService,
    ) {}

    public function index(Request $request): Response
    {
        return inertia('configuration/points/index', [
            'points' => $this->pointService->list(
                $request->get('search', ''),
                $request->only(['search', 'status', 'date_from', 'date_to']),
            ),
            'filters' => $request->only(['search', 'status', 'date_from', 'date_to']),
            'search' => $request->get('search', ''),
        ]);
    }

    public function create(): Response
    {
        return inertia('configuration/points/create');
    }

    public function store(StorePointRequest $request): RedirectResponse
    {
        $this->pointService->create($request->validated());

        return redirect()->route('points.index')
            ->with('success', 'Point action created successfully.');
    }

    public function edit(Point $point): Response
    {
        return inertia('configuration/points/edit', [
            'point' => $point,
        ]);
    }

    public function update(UpdatePointRequest $request, Point $point): RedirectResponse
    {
        $this->pointService->update($point, $request->validated());

        return redirect()->route('points.index')
            ->with('success', 'Point action updated successfully.');
    }

    public function destroy(Point $point): RedirectResponse
    {
        $this->pointService->delete($point);

        return redirect()->route('points.index')
            ->with('success', 'Point action deleted successfully.');
    }

    public function toggle(Point $point): RedirectResponse
    {
        $this->pointService->toggleActive($point);

        return redirect()->route('points.index')
            ->with('success', 'Point action status toggled successfully.');
    }
}
