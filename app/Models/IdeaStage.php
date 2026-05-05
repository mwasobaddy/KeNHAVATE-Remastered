<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IdeaStage extends Model
{
    protected $fillable = [
        'name',
        'description',
        'order',
    ];

    public function ideas()
    {
        return $this->hasMany(Idea::class);
    }

    public function statuses()
    {
        return $this->hasMany(IdeaStatus::class);
    }
}
