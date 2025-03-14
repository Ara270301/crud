import { Inertia } from '@inertiajs/inertia';
import { useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import NavBar from '../navBar';

interface Book {
    id: number;
    title: string;
    author: string;
    ISBN: string;
    genre: string;
    publication_date: string;
}

const BookTable: React.FC = () => {
    const {
        books: initialBooks = [],
        errors: pageErrors = {},
        message,
    } = usePage<{
        books: Book[];
        errors?: any;
        message?: string;
    }>().props;

    const [books, setBooks] = useState<Book[]>(initialBooks);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const booksPerPage = 6;

    const { data, setData, post, put, errors, reset } = useForm({
        id: 0,
        title: '',
        author: '',
        ISBN: '',
        genre: '',
        publication_date: '',
    });

    useEffect(() => {
        setBooks(initialBooks);
        if (message) {
            setSuccessMessage(message);
            setTimeout(() => setSuccessMessage(null), 3000);
        }
    }, [initialBooks, message]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.id === 0) {
            post(route('book.store'), {
                preserveState: true,
                onSuccess: () => {
                    reset();
                    Inertia.visit(route('book.index'), { only: ['books', 'message'], preserveState: true });
                },
                onError: (errors) => {
                    console.log('Form submission errors:', errors);
                },
            });
        } else {
            put(route('book.update', data.id), {
                preserveState: true,
                onSuccess: () => {
                    reset();
                    Inertia.visit(route('book.index'), { only: ['books', 'message'], preserveState: true });
                },
                onError: (errors) => {
                    console.log('Form submission errors:', errors);
                },
            });
        }
    };

    const handleEditBook = (book: Book) => {
        setData({
            id: book.id,
            title: book.title,
            author: book.author,
            ISBN: book.ISBN,
            genre: book.genre,
            publication_date: book.publication_date,
        });
    };

    const handleDeleteBook = (id: number) => {
        if (confirm('Are you sure?')) {
            Inertia.delete(route('book.destroy', id), {
                onSuccess: () => {
                    Inertia.reload({ only: ['books', 'message'] });
                },
            });
        }
    };

    const filteredBooks = (books || []).filter((book) =>
        `${book.title} ${book.author} ${book.ISBN} ${book.genre}`.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    const currentBook = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

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
                    <h2 className="mb-4 text-2xl font-bold">{data.id === 0 ? 'Add Book' : 'Update Book'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-4 shadow-lg">
                        <div>
                            <input
                                type="text"
                                className="w-full rounded-md border p-2"
                                placeholder="Title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                            />
                            {errors.title && <div className="mt-1 text-sm text-red-500">{errors.title}</div>}
                        </div>

                        <div>
                            <input
                                type="text"
                                className="w-full rounded-md border p-2"
                                placeholder="Author"
                                value={data.author}
                                onChange={(e) => setData('author', e.target.value)}
                            />
                            {errors.author && <div className="mt-1 text-sm text-red-500">{errors.author}</div>}
                        </div>

                        <div>
                            <input
                                type="text"
                                className="w-full rounded-md border p-2"
                                placeholder="ISBN"
                                value={data.ISBN}
                                onChange={(e) => setData('ISBN', e.target.value)}
                            />
                            {errors.ISBN && <div className="mt-1 text-sm text-red-500">{errors.ISBN}</div>}
                        </div>

                        <div>
                            <input
                                type="text"
                                className="w-full rounded-md border p-2"
                                placeholder="Genre"
                                value={data.genre}
                                onChange={(e) => setData('genre', e.target.value)}
                            />
                            {errors.genre && <div className="mt-1 text-sm text-red-500">{errors.genre}</div>}
                        </div>

                        <div>
                            <input
                                type="date"
                                className="w-full rounded-md border p-2"
                                value={data.publication_date}
                                onChange={(e) => setData('publication_date', e.target.value)}
                            />
                            {errors.publication_date && <div className="mt-1 text-sm text-red-500">{errors.publication_date}</div>}
                        </div>

                        <div className="mt-4 flex justify-between">
                            <button type="button" onClick={() => reset()} className="mr-2 w-full rounded-md bg-[#526371] p-2 text-white">
                                Reset
                            </button>
                            <button type="submit" className="w-full rounded-md bg-[#00cfc1] p-2 text-white">
                                {data.id === 0 ? 'Add Book' : 'Update Book'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Side: Table and Controls */}
                <div className="flex w-full flex-col md:w-2/3">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xl font-bold">Book List</h3>
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                className="h-9 w-64 rounded-md border p-2"
                                placeholder="Search Books"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button className="rounded-md bg-[#2f6690] p-2 text-sm text-white">Search</button>
                        </div>
                    </div>

                    {successMessage && <div className="mb-4 rounded-md bg-green-100 p-2 text-green-700">{successMessage}</div>}

                    <table className="w-full table-auto border-collapse rounded-xl border border-blue-500 shadow-lg">
                        <thead>
                            <tr className="bg-[#2f6690] text-white">
                                <th className="border border-blue-500 px-4 py-2">ID</th>
                                <th className="border border-blue-500 px-4 py-2">Title</th>
                                <th className="border border-blue-500 px-4 py-2">Author</th>
                                <th className="border border-blue-500 px-4 py-2">ISBN</th>
                                <th className="border border-blue-500 px-4 py-2">Genre</th>
                                <th className="border border-blue-500 px-4 py-2">Publication Date</th>
                                <th className="border border-blue-500 px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentBook.map(
                                (
                                    book, 
                                ) => (
                                    <tr key={book.id}>
                                        <td className="border px-4 py-2 text-center">{book.id}</td>
                                        <td className="border px-4 py-2 text-center">{book.title}</td>
                                        <td className="border px-4 py-2 text-center">{book.author}</td>
                                        <td className="border px-4 py-2 text-center">{book.ISBN}</td>
                                        <td className="border px-4 py-2 text-center">{book.genre}</td>
                                        <td className="border px-4 py-2 text-center">{book.publication_date}</td>
                                        <td className="border px-4 py-2 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    onClick={() => handleEditBook(book)}
                                                    className="flex items-center justify-center rounded-full border border-[#42d9c8] p-3 text-sm text-[#42d9c8]"
                                                >
                                                    Update
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBook(book.id)}
                                                    className="flex items-center justify-center rounded-full border border-[#bb3300] p-3 text-sm text-[#bb3300]"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ),
                            )}
                        </tbody>
                    </table>
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

export default BookTable;
