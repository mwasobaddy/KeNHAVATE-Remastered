<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BugReportAttachment extends Model
{
    protected $fillable = [
        'bug_report_id',
        'file_path',
        'original_name',
        'file_size',
        'mime_type',
    ];

    public function bugReport(): BelongsTo
    {
        return $this->belongsTo(BugReport::class);
    }
}
