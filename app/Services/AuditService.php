<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class AuditService
{
    public function log(User $user, string $action, ?string $description = null): AuditLog
    {
        return AuditLog::create([
            'user_id' => $user->id,
            'action' => $action,
            'description' => $description,
        ]);
    }

    public function getAll(int $perPage = 20): LengthAwarePaginator
    {
        return AuditLog::with('user')
            ->latest('created_at')
            ->paginate($perPage);
    }
}
