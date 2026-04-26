<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'code',
        'description',
        'directorate_id',
        'is_active',
    ];

    /**
     * Get the directorate that the department belongs to.
     */
    public function directorate()
    {
        return $this->belongsTo(Directorate::class);
    }

    /**
     * Get the region through the directorate.
     */
    public function region()
    {
        return $this->hasOneThrough(Region::class, Directorate::class, 'id', 'id', 'directorate_id', 'id');
    }

    /**
     * Get the users for the department.
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }
}
