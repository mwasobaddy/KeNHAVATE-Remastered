<?php

namespace App\Http\Controllers\Api\Points;

use App\Http\Controllers\Controller;
use App\Models\PointTransaction;
use Illuminate\Http\JsonResponse;

class TransactionController extends Controller
{
    public function index(): JsonResponse
    {
        $transactions = PointTransaction::with(['user', 'point'])
            ->latest('created_at')
            ->paginate(30);

        return response()->json($transactions);
    }
}
