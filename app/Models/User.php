<?php

// app/Models/User.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'avatar',
        'is_active', 'employee_id', 'last_login_at',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'is_active' => 'boolean',
        'password' => 'hashed',
    ];

    public function isAdmin(): bool
    {
        return in_array($this->role, ['super_admin', 'admin', 'manager']);
    }

    public function isEmployee(): bool
    {
        return in_array($this->role, ['employee', 'intern']);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function uploadedMedia()
    {
        return $this->hasMany(Media::class, 'uploaded_by');
    }
}
