import { Inertia } from '@inertiajs/inertia';
import { useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import NavBar from '../navBar';

interface Borrow {
    id: number;
    user_id: number;
    user_name: string;
    book_id: number;
    book_title: string;
    issue_date: string;
    due_date: string;
    return_date: string | null;
}

interface User {
    id: number;
    fname: string;
    mname: string | null;
    lname: string;
}

interface Book {
    id: number;
    title: string;
    isBorrowed: boolean;
}

const Borrow: React.FC = () => {
    const {
        borrowings: initialBorrowings = [],
        users = [],
        books = [],
        errors: pageErrors = {},
        message,
    } = usePage<{
        borrowings: Borrow[];
        users: User[];
        books: Book[];
        errors?: Record<string, string>;
        message?: string;
    }>().props;

    const [borrowings, setBorrowings] = useState<Borrow[]>(initialBorrowings);
    const [showReturnedBooks, setShowReturnedBooks] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1); 
    const borrowPerPage = 5;

    const { data, setData, post, errors, reset } = useForm({
        user_id: '',
        book_id: '',
        issue_date: '',
        due_date: '',
    });

    useEffect(() => {
        setBorrowings(initialBorrowings);
        if (message) {
            setSuccessMessage(message);
            setTimeout(() => setSuccessMessage(null), 3000);
        }
    }, [initialBorrowings, message]);

    const handleIssueBook = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('borrowings.store'), {
            preserveState: true,
            onSuccess: () => {
                reset();
                Inertia.visit(route('borrowings.index'), { only: ['borrowings', 'message'], preserveState: true });
            },
            onError: (err) => {
                console.log('Form submission errors:', err);
            },
        });
    };

    const handleReturnBook = (id: number) => {
        const returnDate = new Date().toISOString().split('T')[0];
        Inertia.post(
            route('borrowings.return', id),
            { return_date: returnDate },
            {
                onSuccess: () => {
                    Inertia.reload({ only: ['borrowings', 'message'] });
                },
                onError: (err) => {
                    console.log('Return errors:', err);
                },
            },
        );
    };


    const currentlyBorrowedBooks = borrowings.filter((book) => !book.return_date);
    const returnedBooks = borrowings.filter((book) => book.return_date);
    const filteredBorrowedBooks = currentlyBorrowedBooks.filter((book) =>
        `${book.user_name} ${book.book_title} ${book.issue_date} ${book.due_date}`.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const selectedBook = books.find((book) => book.id === Number(data.book_id));
    const isBookBorrowed = selectedBook?.isBorrowed || false;

    const indexOfLastBorrow = currentPage * borrowPerPage;
    const indexOfFirstBorrow = indexOfLastBorrow - borrowPerPage;
    const currentBorrow = filteredBorrowedBooks.slice(indexOfFirstBorrow, indexOfLastBorrow);
    const totalPages = Math.ceil(filteredBorrowedBooks.length / borrowPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <>
            <NavBar />
            <div className="container mx-auto flex flex-col gap-6 p-4 md:flex-row">
                {/* Left Side: Form */}
                <div className="flex w-full flex-col md:w-1/3">
                    <h2 className="mb-4 text-2xl font-bold">Issue a New Book</h2>
                    <form onSubmit={handleIssueBook} className="space-y-4 rounded-lg bg-white p-4 shadow-lg">
                        <div>
                            <select
                                className="w-full rounded-md border p-2"
                                value={data.user_id}
                                onChange={(e) => setData('user_id', e.target.value)}
                            >
                                <option value="">Select Borrower</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.fname} {user.mname || ''} {user.lname}
                                    </option>
                                ))}
                            </select>
                            {errors.user_id && <div className="mt-1 text-sm text-red-500">{errors.user_id}</div>}
                        </div>

                        <div>
                            <select
                                className="w-full rounded-md border p-2"
                                value={data.book_id}
                                onChange={(e) => setData('book_id', e.target.value)}
                            >
                                <option value="">Select Book</option>
                                {books.map((book) => (
                                    <option key={book.id} value={book.id}>
                                        {book.title}
                                    </option>
                                ))}
                            </select>
                            {errors.book_id && <div className="mt-1 text-sm text-red-500">{errors.book_id}</div>}
                            {isBookBorrowed && <div className="mt-1 text-sm text-red-500">This book is already borrowed.</div>}
                        </div>

                        <div>
                            <input
                                type="date"
                                className="w-full rounded-md border p-2"
                                value={data.issue_date}
                                onChange={(e) => setData('issue_date', e.target.value)}
                            />
                            {errors.issue_date && <div className="mt-1 text-sm text-red-500">{errors.issue_date}</div>}
                        </div>

                        <div>
                            <input
                                type="date"
                                className="w-full rounded-md border p-2"
                                value={data.due_date}
                                onChange={(e) => setData('due_date', e.target.value)}
                            />
                            {errors.due_date && <div className="mt-1 text-sm text-red-500">{errors.due_date}</div>}
                        </div>

                        <div className="mt-4 flex justify-between">
                            <button type="button" onClick={() => reset()} className="mr-2 w-full rounded-md bg-[#526371] p-2 text-white">
                                Reset
                            </button>
                            <button type="submit" className="w-full rounded-md bg-[#00cfc1] p-2 text-white" disabled={isBookBorrowed}>
                                Issue Book
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Side: Tables and Controls */}
                <div className="flex w-full flex-col md:w-2/3">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xl font-bold"></h3>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    className="h-9 w-64 rounded-md border p-2"
                                    placeholder="Search Borrowed Books"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button className="rounded-md bg-[#2f6690] p-2 text-sm text-white">Search</button>
                            </div>
                            <button
                                onClick={() => setShowReturnedBooks(!showReturnedBooks)}
                                className="rounded-md bg-[#526371] p-2 text-sm text-white"
                            >
                                {showReturnedBooks ? 'Hide Returned' : 'Show Returned'}
                            </button>
                        </div>
                    </div>

                    {successMessage && <div className="mb-4 rounded-md bg-green-100 p-2 text-green-700">{successMessage}</div>}

                    <div className="mb-6">
                        <h4 className="mb-2 text-xl font-bold">Currently Borrowed Books</h4>
                        <table className="w-full table-auto border-collapse rounded-xl border border-blue-500 shadow-lg">
                            <thead>
                                <tr className="bg-[#2f6690] text-white">
                                    <th className="border border-blue-500 px-4 py-2">ID</th>
                                    <th className="border border-blue-500 px-4 py-2">Borrower</th>
                                    <th className="border border-blue-500 px-4 py-2">Book</th>
                                    <th className="border border-blue-500 px-4 py-2">Issue Date</th>
                                    <th className="border border-blue-500 px-4 py-2">Due Date</th>
                                    <th className="border border-blue-500 px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentBorrow.map((book) => (
                                    <tr key={book.id}>
                                        <td className="border px-4 py-2 text-center">{book.id}</td>
                                        <td className="border px-4 py-2 text-center">{book.user_name}</td>
                                        <td className="border px-4 py-2 text-center">{book.book_title}</td>
                                        <td className="border px-4 py-2 text-center">{book.issue_date}</td>
                                        <td className="border px-4 py-2 text-center">{book.due_date}</td>
                                        <td className="border px-4 py-2 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    onClick={() => handleReturnBook(book.id)}
                                                    className="flex items-center justify-center rounded-full border border-[#42d9c8] p-3 text-sm text-[#42d9c8]"
                                                >
                                                    Return
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {showReturnedBooks && (
                        <div className="mt-6">
                            <h4 className="mb-2 text-xl font-bold">Returned Books</h4>
                            <table className="w-full table-auto border-collapse rounded-xl border border-blue-500 shadow-lg">
                                <thead>
                                    <tr className="bg-[#2f6690] text-white">
                                        <th className="border border-blue-500 px-4 py-2">ID</th>
                                        <th className="border border-blue-500 px-4 py-2">Borrower</th>
                                        <th className="border border-blue-500 px-4 py-2">Book</th>
                                        <th className="border border-blue-500 px-4 py-2">Issue Date</th>
                                        <th className="border border-blue-500 px-4 py-2">Return Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {returnedBooks.map((book) => (
                                        <tr key={book.id}>
                                            <td className="border px-4 py-2 text-center">{book.id}</td>
                                            <td className="border px-4 py-2 text-center">{book.user_name}</td>
                                            <td className="border px-4 py-2 text-center">{book.book_title}</td>
                                            <td className="border px-4 py-2 text-center">{book.issue_date}</td>
                                            <td className="border px-4 py-2 text-center">{book.return_date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {/* Pagination Controls */}
                    <div className="mt-4 flex justify-between">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className={`rounded-md p-2 text-white ${
                                currentPage === 1 ? 'cursor-not-allowed bg-gray-400' : 'bg-[#2f6690] hover:bg-[#1f4b6b]'
                            }`}
                        >
                            Previous
                        </button>
                        <span className="text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className={`rounded-md p-2 text-white ${
                                currentPage === totalPages ? 'cursor-not-allowed bg-gray-400' : 'bg-[#2f6690] hover:bg-[#1f4b6b]'
                            }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Borrow;
