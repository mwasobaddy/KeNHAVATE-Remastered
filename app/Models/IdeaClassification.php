<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IdeaClassification extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
    ];

    public function ideas(): HasMany
    {
        return $this->hasMany(Idea::class, 'classification_id');
    }
}
