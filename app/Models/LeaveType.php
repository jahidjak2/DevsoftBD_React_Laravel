<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaveType extends Model
{
    protected $fillable = ['name', 'days_allowed', 'is_paid', 'carry_forward', 'color', 'is_active'];

    protected $casts = [
        'is_paid' => 'boolean',
        'carry_forward' => 'boolean',
        'is_active' => 'boolean',
    ];
}
