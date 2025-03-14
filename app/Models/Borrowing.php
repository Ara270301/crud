<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Borrowing extends Model
{
    use HasFactory;

   public $timestamps = false;
   
    protected $fillable = [
        'user_id',
        'book_id',
        'issue_date',
        'due_date',
        'return_date',
    ];

    /**
     * Get the user that owns the borrowing record.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function book()
    {
        return $this->belongsTo(Book::class, 'book_id');
    }
}
