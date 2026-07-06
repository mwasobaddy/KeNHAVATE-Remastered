<?php

namespace App\Http\Controllers\Ideas;

use App\Http\Controllers\Controller;
use App\Services\Ideas\CollaborationRequestService;
use Illuminate\Http\Request;
use Inertia\Response;

class CollaborationRequestController extends Controller
{
    public function __construct(
        private CollaborationRequestService $collaborationRequestService,
    ) {}

    public function inbox(Request $request): Response
    {
        return inertia('ideas/collaborations/request/inbox', [
            'requests' => $this->collaborationRequestService->getInbox($request->user()),
        ]);
    }

    public function outbox(Request $request): Response
    {
        return inertia('ideas/collaborations/request/outbox', [
            'requests' => $this->collaborationRequestService->getOutbox($request->user()),
        ]);
    }
}
