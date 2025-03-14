<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\UserController;    
use App\Http\Controllers\BookController;
use App\Http\Controllers\BorrowController;

Route::get('/user', [UserController::class, 'index'])->name('user.index');
Route::post('/user', [UserController::class, 'store'])->name('user.store');
Route::put('/user/{user}', [UserController::class, 'update'])->name('user.update');
Route::delete('/user/{user}', [UserController::class, 'destroy'])->name('user.destroy');

Route::get('/book', [BookController::class, 'index'])->name('book.index');
Route::post('/book', [BookController::class, 'store'])->name('book.store');
Route::put('/book/{book}', [BookController::class, 'update'])->name('book.update');
Route::delete('/book/{book}', [BookController::class, 'destroy'])->name('book.destroy');

Route::get('/borrow', [BorrowController::class, 'index'])->name('borrowings.index');
Route::post('/borrow', [BorrowController::class, 'store'])->name('borrowings.store');
Route::get('/borrow/{id}', [BorrowController::class, 'show'])->name('borrowings.show');
Route::put('/borrow/{id}', [BorrowController::class, 'update'])->name('borrowings.update');
Route::delete('/borrow/{id}', [BorrowController::class, 'destroy'])->name('borrowings.destroy');
Route::post('/borrow/{id}/return', [BorrowController::class, 'returnBook'])->name('borrowings.return');

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');




Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
