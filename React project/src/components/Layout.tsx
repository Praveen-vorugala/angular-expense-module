import React from 'react';
import { Link } from 'react-router-dom';
import { useExpense } from '../store/ExpenseContext';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { currentUser, logout } = useExpense();

    const navigation = [
        { name: 'Dashboard', href: '/', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
        { name: 'Add Report', href: '/add-report', roles: ['EMPLOYEE', 'MANAGER'] },
        { name: 'Approve Expenses', href: '/approve-expenses', roles: ['MANAGER'] },
        { name: 'Manage Policies', href: '/policies', roles: ['ADMIN'] },
        { name: 'Expense Types', href: '/expense-types', roles: ['ADMIN'] },
        { name: 'Dropdown Types', href: '/dropdown-types', roles: ['ADMIN'] },
        { name: 'User Properties', href: '/user-properties', roles: ['ADMIN'] },
        { name: 'Reports', href: '/reports', roles: ['ADMIN','EMPLOYEE','MANAGER'] },
    ];

    const filteredNavigation = navigation.filter(item => 
        item.roles.includes(currentUser?.role || '')
    );

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-indigo-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <span className="text-white text-xl font-bold">
                                    Expense Management
                                </span>
                            </div>
                            <div className="hidden md:block">
                                <div className="ml-10 flex items-baseline space-x-4">
                                    {filteredNavigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-4 flex items-center md:ml-6">
                                <span className="text-white mr-4">
                                    {currentUser?.name} ({currentUser?.role})
                                </span>
                                <button
                                    onClick={logout}
                                    className="bg-indigo-700 p-1 rounded-full text-white hover:bg-indigo-800 focus:outline-none"
                                >
                                    <span className="px-3 py-1">Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout; 