<?php
namespace App\Http\Controllers;

use App\Models\Borrowing;
use App\Models\Book;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;

class BorrowController extends Controller
{
    public function index()
    {
        try {
            $borrowings = Borrowing::with(['user', 'book'])->get()->map(function ($borrowing) {
                return [
                    'id' => $borrowing->id,
                    'user_id' => $borrowing->user_id,
                    'user_name' => $borrowing->user->fname . ' ' . ($borrowing->user->mname ? $borrowing->user->mname . ' ' : '') . $borrowing->user->lname,                    'book_id' => $borrowing->book_id,
                    'book_title' => $borrowing->book->title,
                    'issue_date' => $borrowing->issue_date,
                    'due_date' => $borrowing->due_date,
                    'return_date' => $borrowing->return_date ?? null,
                ];
            });
            
            $users = User::all(['id', 'fname', 'mname', 'lname'])->toArray();
            $books = Book::all(['id', 'title'])->toArray();
            
            $books = Book::all(['id', 'title'])->map(function ($book) {
            $isBorrowed = Borrowing::where('book_id', $book->id)
                ->whereNull('return_date')
                ->exists();
            return [
                'id' => $book->id,
                'title' => $book->title,
                'isBorrowed' => $isBorrowed,
            ];
        })->toArray();

            return Inertia::render('crud/borrow', [
         'borrowings' => $borrowings,
            'users' => User::all(['id', 'fname', 'mname', 'lname'])->toArray(),
            'books' => $books,]);
        } catch (\Exception $e) {
            Log::error('Error fetching borrowings: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to fetch borrowings']);
        }
    }

   public function store(Request $request)
{
    try {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'book_id' => 'required|exists:books,id',
            'issue_date' => 'required|date',
            'due_date' => 'required|date|after:issue_date',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors())->withInput();
        }

        // Check if book is available
        $existingBorrow = Borrowing::where('book_id', $request->book_id)
            ->whereNull('return_date')
            ->first();
        
        if ($existingBorrow) {
            return back()->withErrors(['error' => 'This book is currently borrowed']);
        }

        $borrowing = Borrowing::create([
            'user_id' => $request->user_id,
            'book_id' => $request->book_id,
            'issue_date' => $request->issue_date,
            'due_date' => $request->due_date,
        ]);

        return redirect()->route('borrowings.index')->with('message', 'Book borrowed successfully');
    } catch (\Exception $e) {
        Log::error('Full error creating borrowing: ' . $e->getMessage() . ' | Stack: ' . $e->getTraceAsString());
        return back()->withErrors(['error' => 'Failed to create borrowing: ' . $e->getMessage()]);
    }
}

    public function show($id)
    {
        try {
            $borrowing = Borrowing::with(['user', 'book'])->findOrFail($id);
            
            return Inertia::render('crud/borrowings-show', [
                'borrowings' => [
                    'id' => $borrowing->id,
                    'user_id' => $borrowing->user_id,
                    'user_name' => $borrowing->user->fname . ' ' . $borrowing->user->lname,
                    'book_id' => $borrowing->book_id,
                    'book_title' => $borrowing->book->title,
                    'issue_date' => $borrowing->issue_date,
                    'due_date' => $borrowing->due_date,
                    'return_date' => $borrowing->return_date ?? null,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error showing borrowing: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Borrowing record not found']);
        }
    }

    // public function update(Request $request, $id)
    // {
    //     try {
    //         $borrowing = Borrowing::findOrFail($id);

    //         $validator = Validator::make($request->all(), [
    //             'issue_date' => 'sometimes|required|date',
    //             'due_date' => 'sometimes|required|date|after:issue_date',
    //             'return_date' => 'sometimes|nullable|date|after:issue_date',
    //         ]);

    //         if ($validator->fails()) {
    //             return back()->withErrors($validator->errors())->withInput();
    //         }

    //         $borrowing->update($request->only(['issue_date', 'due_date', 'return_date']));

    //         return redirect()->route('borrowings.index')->with('message', 'Borrowing updated successfully');
    //     } catch (\Exception $e) {
    //         Log::error('Error updating borrowing: ' . $e->getMessage());
    //         return back()->withErrors(['error' => 'Failed to update borrowing: ' . $e->getMessage()]);
    //     }
    // }

    // public function destroy($id)
    // {
    //     try {
    //         $borrowing = Borrowing::findOrFail($id);
    //         $borrowing->delete();

    //         return redirect()->route('borrowings.index')->with('message', 'Borrowing record deleted successfully');
    //     } catch (\Exception $e) {
    //         Log::error('Error deleting borrowing: ' . $e->getMessage());
    //         return back()->withErrors(['error' => 'Failed to delete borrowing: ' . $e->getMessage()]);
    //     }
    // }

    // New method to mark a book as returned
    public function returnBook(Request $request, $id)
    {
        try {
            $borrowing = Borrowing::findOrFail($id);
            
            $validator = Validator::make($request->all(), [
                'return_date' => 'required|date|after:issue_date'
            ]);

            if ($validator->fails()) {
                return back()->withErrors($validator->errors())->withInput();
            }

            $borrowing->update([
                'return_date' => $request->return_date
            ]);

            return redirect()->route('borrowings.index')->with('message', 'Book borrowed successfully');
        } catch (\Exception $e) {
            Log::error('Error returning book: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to return book: ' . $e->getMessage()]);
        }
    }
}