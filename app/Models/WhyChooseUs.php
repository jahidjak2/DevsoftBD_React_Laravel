<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhyChooseUs extends Model
{
    protected $table = 'why_choose_us';

    protected $fillable = [
        'icon', 'icon_color', 'title', 'description',
        'stat_value', 'stat_label', 'sort_order', 'is_active',
    ];

    protected $casts = ['is_active' => 'boolean'];
}
