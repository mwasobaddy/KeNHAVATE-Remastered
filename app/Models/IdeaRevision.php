<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IdeaRevision extends Model
{
    protected $table = 'idea_revisions';

    protected $fillable = ['idea_id', 'changed_by', 'field', 'old_value', 'new_value'];

    public function idea()
    {
        return $this->belongsTo(Idea::class);
    }

    public function changedBy()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
