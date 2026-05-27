<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    protected $fillable = [
        'employee_id', 'leave_type_id', 'start_date', 'end_date',
        'days_count', 'reason', 'status', 'approved_by', 'admin_note', 'responded_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'responded_at' => 'datetime',
        'days_count' => 'decimal:1',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function leaveType()
    {
        return $this->belongsTo(LeaveType::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /** Calculate weekday count between two dates */
    public static function calculateDays(string $start, string $end): float
    {
        $startDate = Carbon::parse($start);
        $endDate = Carbon::parse($end);
        $days = 0;
        while ($startDate->lte($endDate)) {
            if (! $startDate->isWeekend()) {
                $days++;
            }
            $startDate->addDay();
        }

        return $days;
    }
}
