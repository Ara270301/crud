<?php
namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class BookController extends Controller
{
    public function index()
    {
        return Inertia::render('crud/book', [
            'books' => Book::all()->map(function ($book) {
                return [
                    'id' => $book->id,
                    'title' => $book->title,
                    'author' => $book->author,
                    'ISBN' => $book->ISBN,
                    'genre' => $book->genre,
                    'publication_date' => $book->publication_date,
                ];
            })->toArray(),
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'title' => 'required|string|max:255',
                'author' => 'required|string|max:255',
                'ISBN' => 'required|string|max:13|unique:books,ISBN',
                'genre' => 'required|string|max:100',
                'publication_date' => 'required|date',
            ]);

            Book::create($validatedData);

            return Inertia::render('crud/book', [
                'books' => Book::all()->map(function ($book) {
                    return [
                        'id' => $book->id,
                        'title' => $book->title,
                        'author' => $book->author,
                        'ISBN' => $book->ISBN,
                        'genre' => $book->genre,
                        'publication_date' => $book->publication_date,
                    ];
                })->toArray(),
                'message' => 'Book created successfully',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->validator->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Error storing book: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to create book: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, Book $book)
    {
        try {
            $validatedData = $request->validate([
                'title' => 'required|string|max:255',
                'author' => 'required|string|max:255' . $book->id,
                'ISBN' => 'required|string|max:13|unique:books,ISBN,' . $book->id,
                'genre' => 'required|string|max:100',
                'publication_date' => 'required|date',
            ]);

            $book->update($validatedData);

            return Inertia::render('crud/book', [
                'books' => Book::all()->map(function ($book) {
                    return [
                        'id' => $book->id,
                        'title' => $book->title,
                        'author' => $book->author,
                        'ISBN' => $book->ISBN,
                        'genre' => $book->genre,
                        'publication_date' => $book->publication_date,
                    ];
                })->toArray(),
                'message' => 'Book updated successfully',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->validator->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Error updating book: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to update book: ' . $e->getMessage()]);
        }
    }

    public function destroy(Book $book)
    {
        try {
            $book->delete();

            return Inertia::render('crud/book', [
                'books' => Book::all()->map(function ($book) {
                    return [
                        'id' => $book->id,
                        'title' => $book->title,
                        'author' => $book->author,
                        'ISBN' => $book->ISBN,
                        'genre' => $book->genre,
                        'publication_date' => $book->publication_date,
                    ];
                })->toArray(),
                'message' => 'Book deleted successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting book: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to delete book: ' . $e->getMessage()]);
        }
    }
}