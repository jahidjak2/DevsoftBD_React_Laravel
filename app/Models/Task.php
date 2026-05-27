<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'internal_project_id', 'milestone_id', 'title', 'description',
        'assigned_to', 'created_by', 'status', 'priority',
        'due_date', 'estimated_hours', 'sort_order', 'tags',
    ];

    protected $casts = [
        'due_date' => 'date',
        'estimated_hours' => 'decimal:2',
        'tags' => 'array',
    ];

    public function project()
    {
        return $this->belongsTo(InternalProject::class, 'internal_project_id');
    }

    public function milestone()
    {
        return $this->belongsTo(Milestone::class);
    }

    public function assignee()
    {
        return $this->belongsTo(Employee::class, 'assigned_to');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function comments()
    {
        return $this->hasMany(TaskComment::class)->orderBy('created_at');
    }

    public function timeLogs()
    {
        return $this->hasMany(TaskTimeLog::class);
    }

    public function getLoggedHoursAttribute(): float
    {
        return (float) $this->timeLogs()->sum('hours');
    }
}
