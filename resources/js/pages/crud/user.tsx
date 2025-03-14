import { Inertia } from '@inertiajs/inertia';
import { useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import NavBar from '../navBar';

interface User {
    id: number;
    fname: string;
    mname: string | null;
    lname: string;
    email: string;
    contact_no: string;
    role: string;
}

const UserTable: React.FC = () => {
    const {
        users: initialUsers = [],
        errors: pageErrors = {},
        message,
    } = usePage<{
        users: User[];
        errors?: any;
        message?: string;
    }>().props;

    const [users, setUsers] = useState<User[]>(initialUsers);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1); 
    const usersPerPage = 5;

    const { data, setData, post, put, errors, reset } = useForm({
        id: 0,
        fname: '',
        mname: '' as string | null,
        lname: '',
        email: '',
        contact_no: '',
        role: '',
    });

    useEffect(() => {
        setUsers(initialUsers);
        if (message) {
            setSuccessMessage(message);
            setTimeout(() => setSuccessMessage(null), 3000);
        }
    }, [initialUsers, message]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.id === 0) {
            post(route('user.store'), {
                preserveState: true,
                onSuccess: () => {
                    reset();
                    Inertia.visit(route('user.index'), { only: ['users', 'message'], preserveState: true });
                },
                onError: (errors) => {
                    console.log('Form submission errors:', errors);
                },
            });
        } else {
            put(route('user.update', data.id), {
                preserveState: true,
                onSuccess: () => {
                    reset();
                    Inertia.visit(route('user.index'), { only: ['users', 'message'], preserveState: true });
                },
                onError: (errors) => {
                    console.log('Form submission errors:', errors);
                },
            });
        }
    };

    const handleEditUser = (user: User) => {
        setData({
            id: user.id,
            fname: user.fname,
            mname: user.mname || null,
            lname: user.lname,
            email: user.email,
            contact_no: user.contact_no,
            role: user.role,
        });
    };

    const handleDeleteUser = (id: number) => {
        if (confirm('Are you sure?')) {
            Inertia.delete(route('user.destroy', id), {
                onSuccess: () => {
                    Inertia.reload({ only: ['users', 'message'] });
                },
            });
        }
    };

    const filteredUsers = (users || []).filter((user) =>
        `${user.fname} ${user.mname || ''} ${user.lname}`.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

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
                    <h2 className="mb-4 text-2xl font-bold">{data.id === 0 ? 'Add User' : 'Update User'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-4 shadow-lg">
                        <div>
                            <input
                                type="text"
                                className="w-full rounded-md border p-2"
                                placeholder="First Name"
                                value={data.fname}
                                onChange={(e) => setData('fname', e.target.value)}
                            />
                            {errors.fname && <div className="mt-1 text-sm text-red-500">{errors.fname}</div>}
                        </div>

                        <div>
                            <input
                                type="text"
                                className="w-full rounded-md border p-2"
                                placeholder="Middle Name"
                                value={data.mname || ''}
                                onChange={(e) => setData('mname', e.target.value)}
                            />
                        </div>

                        <div>
                            <input
                                type="text"
                                className="w-full rounded-md border p-2"
                                placeholder="Last Name"
                                value={data.lname}
                                onChange={(e) => setData('lname', e.target.value)}
                            />
                            {errors.lname && <div className="mt-1 text-sm text-red-500">{errors.lname}</div>}
                        </div>

                        <div>
                            <input
                                type="email"
                                className="w-full rounded-md border p-2"
                                placeholder="Email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && <div className="mt-1 text-sm text-red-500">{errors.email}</div>}
                        </div>

                        <div>
                            <input
                                type="text"
                                className="w-full rounded-md border p-2"
                                placeholder="Contact Number"
                                value={data.contact_no}
                                onChange={(e) => setData('contact_no', e.target.value)}
                            />
                            {errors.contact_no && <div className="mt-1 text-sm text-red-500">{errors.contact_no}</div>}
                        </div>

                        <div>
                            <input
                                type="text"
                                className="w-full rounded-md border p-2"
                                placeholder="Role"
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                            />
                            {errors.role && <div className="mt-1 text-sm text-red-500">{errors.role}</div>}
                        </div>

                        <div className="mt-4 flex justify-between">
                            <button type="button" onClick={() => reset()} className="mr-2 w-full rounded-md bg-[#526371] p-2 text-white">
                                Reset
                            </button>
                            <button type="submit" className="w-full rounded-md bg-[#00cfc1] p-2 text-white">
                                {data.id === 0 ? 'Add User' : 'Update User'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Side: Table and Controls */}
                <div className="flex w-full flex-col md:w-2/3">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xl font-bold">User List</h3>
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                className="h-9 w-64 rounded-md border p-2"
                                placeholder="Search Users"
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
                                <th className="border border-blue-500 px-4 py-2">Profile</th>
                                <th className="border border-blue-500 px-4 py-2">User Name</th>
                                <th className="border border-blue-500 px-4 py-2">Email</th>
                                <th className="border border-blue-500 px-4 py-2">Contact Number</th>
                                <th className="border border-blue-500 px-4 py-2">Role</th>
                                <th className="border border-blue-500 px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.map(
                                (
                                    user, // Changed from filteredUsers to currentUsers
                                ) => (
                                    <tr key={user.id}>
                                        <td className="border px-4 py-2 text-center">{user.id}</td>
                                        <td className="border px-4 py-2 text-center">
                                            <div className="text-md flex h-9 w-9 items-center justify-center rounded-full bg-gray-500 text-white">
                                                {user.fname[0]}
                                                {user.lname[0]}
                                            </div>
                                        </td>
                                        <td className="border px-4 py-2 text-center">
                                            {user.fname} {user.mname || ''} {user.lname}
                                        </td>
                                        <td className="border px-4 py-2 text-center">{user.email}</td>
                                        <td className="border px-4 py-2 text-center">{user.contact_no}</td>
                                        <td className="border px-4 py-2 text-center">{user.role}</td>
                                        <td className="border px-4 py-2 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    className="flex items-center justify-center rounded-full border border-[#42d9c8] p-3 text-sm text-[#42d9c8]"
                                                >
                                                    Update
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
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

export default UserTable;
