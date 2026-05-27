<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskTimeLog extends Model
{
    protected $fillable = ['task_id', 'employee_id', 'hours', 'date', 'note'];

    protected $casts = ['date' => 'date', 'hours' => 'decimal:2'];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
