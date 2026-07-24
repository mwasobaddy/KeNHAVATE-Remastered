<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class IdeaIpDocument extends Model
{
    use SoftDeletes;

    public $timestamps = false;

    protected $fillable = [
        'idea_ip_right_id',
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

    public function ipRight(): BelongsTo
    {
        return $this->belongsTo(IdeaIpRight::class, 'idea_ip_right_id');
    }
}
