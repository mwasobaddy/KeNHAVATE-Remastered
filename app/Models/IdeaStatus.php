<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IdeaStatus extends Model
{
    protected $fillable = [
        'name',
        'description',
        'stage_id',
    ];

    public function stage()
    {
        return $this->belongsTo(IdeaStage::class);
    }

    public function ideas()
    {
        return $this->hasMany(Idea::class);
    }
}
