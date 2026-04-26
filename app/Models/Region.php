<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Region extends Model
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
        'is_active',
    ];

    /**
     * Get the directorates for the region.
     */
    public function directorates()
    {
        return $this->hasMany(Directorate::class);
    }

    /**
     * Get the departments through directorates.
     */
    public function departments()
    {
        return $this->hasManyThrough(Department::class, Directorate::class);
    }

    /**
     * Get the users through departments and directorates.
     */
    public function users()
    {
        return $this->hasManyThrough(User::class, Department::class, Directorate::class);
    }
}
