<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Milestone extends Model
{
    protected $fillable = [
        'internal_project_id', 'title', 'description',
        'due_date', 'completed_at', 'sort_order',
    ];

    protected $casts = [
        'due_date' => 'date',
        'completed_at' => 'date',
    ];

    public function project()
    {
        return $this->belongsTo(InternalProject::class, 'internal_project_id');
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}
