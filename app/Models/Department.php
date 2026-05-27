<?php

// ─────────────────────────────────────────────────────────────
// app/Models/Department.php
// ─────────────────────────────────────────────────────────────

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $fillable = ['name', 'head_employee_id', 'description', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function head()
    {
        return $this->belongsTo(Employee::class, 'head_employee_id');
    }

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }
}
