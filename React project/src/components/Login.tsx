import React, { useState } from 'react';
import { useExpense } from '../store/ExpenseContext';
import { mockUsers } from '../types/expense';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const { login } = useExpense();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login(email);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to Expense Management
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Demo accounts:
                    </p>
                    <div className="mt-2 text-center text-sm text-gray-500">
                        {mockUsers.map(user => (
                            <div key={user.email}>
                                {user.role}: {user.email}
                            </div>
                        ))}
                    </div>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login; 