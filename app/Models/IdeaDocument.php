<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class IdeaDocument extends Model
{
    use SoftDeletes;

    public $timestamps = false;

    protected $fillable = [
        'idea_id',
        'type',
        'file_path',
        'original_name',
        'file_size',
        'mime_type',
    ];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function idea(): BelongsTo
    {
        return $this->belongsTo(Idea::class);
    }
}
