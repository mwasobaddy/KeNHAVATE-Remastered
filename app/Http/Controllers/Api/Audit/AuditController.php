<?php

namespace App\Http\Controllers\Api\Audit;

use App\Http\Controllers\Controller;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;

class AuditController extends Controller
{
    public function __construct(
        private AuditService $auditService,
    ) {}

    public function index(): JsonResponse
    {
        $logs = $this->auditService->getAll();

        return response()->json($logs);
    }
}
