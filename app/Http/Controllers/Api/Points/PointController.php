<?php

namespace App\Http\Controllers\Api\Points;

use App\Http\Controllers\Controller;
use App\Http\Requests\Points\StorePointRequest;
use App\Http\Requests\Points\UpdatePointRequest;
use App\Models\Point;
use App\Services\Points\PointService;
use Illuminate\Http\JsonResponse;

class PointController extends Controller
{
    public function __construct(
        private PointService $pointService,
    ) {}

    public function index(): JsonResponse
    {
        return response()->json($this->pointService->list());
    }

    public function store(StorePointRequest $request): JsonResponse
    {
        $point = $this->pointService->create($request->validated());

        return response()->json($point, 201);
    }

    public function show(Point $point): JsonResponse
    {
        return response()->json($point->load('createdBy'));
    }

    public function update(UpdatePointRequest $request, Point $point): JsonResponse
    {
        $point = $this->pointService->update($point, $request->validated());

        return response()->json($point);
    }

    public function destroy(Point $point): JsonResponse
    {
        $this->pointService->delete($point);

        return response()->json(['message' => 'Point action deleted successfully.']);
    }

    public function toggle(Point $point): JsonResponse
    {
        $point = $this->pointService->toggleActive($point);

        return response()->json($point);
    }
}
