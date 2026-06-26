<?php

namespace App\Http\Controllers;

use App\Services\AuditService;
use Inertia\Response;

class AuditController extends Controller
{
    public function __construct(
        private AuditService $auditService,
    ) {}

    public function index(): Response
    {
        return inertia('audit/index', [
            'logs' => $this->auditService->getAll(),
        ]);
    }
}
