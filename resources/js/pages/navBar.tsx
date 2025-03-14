import React from 'react';
import { usePage } from '@inertiajs/react';

const NavBar: React.FC = () => {
    const { url } = usePage();

    return (
        <nav className="h-20 bg-[#16425b] p-4">
            <div className="flex items-end">
                {/* Left-aligned text */}
                <div className="flex-shrink-0 text-3xl font-bold text-white">Library Management</div>

                <ul className="m-0 flex flex-grow list-none justify-end space-x-9 p-0">
                    <li>
                        <a
                            href="/book"
                            className={`text-2xl text-white hover:text-gray-400 ${url === '/book' ? 'font-bold underline' : ''}`}
                        >
                            Book
                        </a>
                    </li>
                    <li>
                        <a
                            href="/user"
                            className={`text-2xl text-white hover:text-gray-400 ${url === '/user' ? 'font-bold underline' : ''}`}
                        >
                            User
                        </a>
                    </li>
                    <li>
                        <a
                            href="/borrow"
                            className={`text-2xl text-white hover:text-gray-400 ${url === '/borrow' ? 'font-bold underline' : ''}`}
                        >
                            Borrow Book
                        </a>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default NavBar;
