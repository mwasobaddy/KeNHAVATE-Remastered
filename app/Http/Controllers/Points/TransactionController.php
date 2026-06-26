<?php

namespace App\Http\Controllers\Points;

use App\Http\Controllers\Controller;
use App\Models\PointTransaction;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(): Response
    {
        $transactions = PointTransaction::with(['user', 'point'])
            ->latest('created_at')
            ->paginate(30);

        return inertia('points/transactions', [
            'transactions' => $transactions,
        ]);
    }
}
