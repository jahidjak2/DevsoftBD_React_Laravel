<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeDocument extends Model
{
    protected $fillable = [
        'employee_id', 'media_id', 'document_type', 'title', 'notes', 'uploaded_by',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function media()
    {
        return $this->belongsTo(Media::class);
    }
}
