<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'employee_code', 'department_id', 'designation',
        'employment_type', 'join_date', 'end_date', 'phone',
        'emergency_contact_name', 'emergency_contact_phone',
        'address', 'nid_number', 'salary', 'bank_account',
        'avatar_id', 'bio', 'skills', 'linkedin_url', 'github_url', 'is_active',
    ];

    protected $casts = [
        'join_date' => 'date',
        'end_date' => 'date',
        'skills' => 'array',
        'is_active' => 'boolean',
        'salary' => 'decimal:2',
    ];

    // Sensitive fields — never exposed in general API responses
    protected $hidden = ['salary', 'bank_account', 'nid_number'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function avatar()
    {
        return $this->belongsTo(Media::class, 'avatar_id');
    }

    public function documents()
    {
        return $this->hasMany(EmployeeDocument::class);
    }

    public function assignedTasks()
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    public function internalProjects()
    {
        return $this->belongsToMany(InternalProject::class, 'internal_project_members')
            ->withPivot('role', 'joined_at', 'left_at', 'hourly_rate')
            ->withTimestamps();
    }

    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function leaveBalances()
    {
        return $this->hasMany(LeaveBalance::class);
    }

    // Auto-generate employee code: DSB-0042
    public static function generateCode(): string
    {
        $last = static::withTrashed()->orderBy('id', 'desc')->first();
        $next = $last ? ($last->id + 1) : 1;

        return 'DSB-'.str_pad($next, 4, '0', STR_PAD_LEFT);
    }

    public function getAvatarUrlAttribute(): string
    {
        return $this->avatar?->url ?? '';
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
