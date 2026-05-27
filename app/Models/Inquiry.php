<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inquiry extends Model
{
    protected $fillable = [
        'name', 'email', 'phone', 'company', 'subject', 'message',
        'service_interest', 'budget_range', 'status',
        'admin_note', 'replied_at', 'ip_address', 'user_agent',
    ];

    protected $casts = ['replied_at' => 'datetime'];

    public function scopeNew($query)
    {
        return $query->where('status', 'new');
    }
}
