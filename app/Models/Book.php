<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'title',
        'author',
        'ISBN',
        'genre',
        'publication_date',
    ];

    /**
     * Get the borrowings associated with the book.
     */
    public function borrowings()
    {
        return $this->hasMany(Borrowing::class, 'book_id');
    }
}
