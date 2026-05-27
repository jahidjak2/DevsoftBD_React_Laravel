<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InternalProject extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'code', 'description', 'client_name', 'client_contact',
        'manager_id', 'start_date', 'deadline', 'completed_at',
        'status', 'priority', 'budget', 'currency',
        'technologies', 'notes', 'is_billable', 'portfolio_project_id',
    ];

    protected $casts = [
        'technologies' => 'array',
        'start_date' => 'date',
        'deadline' => 'date',
        'completed_at' => 'date',
        'is_billable' => 'boolean',
        'budget' => 'decimal:2',
    ];

    public function manager()
    {
        return $this->belongsTo(Employee::class, 'manager_id');
    }

    public function members()
    {
        return $this->belongsToMany(Employee::class, 'internal_project_members')
            ->withPivot('role', 'joined_at', 'left_at', 'hourly_rate')
            ->withTimestamps();
    }

    public function milestones()
    {
        return $this->hasMany(Milestone::class)->orderBy('sort_order');
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function portfolioProject()
    {
        return $this->belongsTo(Project::class, 'portfolio_project_id');
    }

    public static function generateCode(): string
    {
        $last = static::withTrashed()->orderBy('id', 'desc')->first();
        $next = $last ? ($last->id + 1) : 1;

        return 'PROJ-'.str_pad($next, 3, '0', STR_PAD_LEFT);
    }
}
