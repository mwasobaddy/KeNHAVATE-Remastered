<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Directorate extends Model
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
        'region_id',
        'is_active',
    ];

    /**
     * Get the region that the directorate belongs to.
     */
    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    /**
     * Get the departments for the directorate.
     */
    public function departments()
    {
        return $this->hasMany(Department::class);
    }

    /**
     * Get the users through departments.
     */
    public function users()
    {
        return $this->hasManyThrough(User::class, Department::class);
    }
}
