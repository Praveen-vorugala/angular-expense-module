import React, { useState, useMemo } from 'react';
import { useExpense } from '../store/ExpenseContext';
import { ExpenseReport, ExpenseStatus, mockUsers, mockPolicies, mockExpenseTypes } from '../types/expense';

const ExpenseReports: React.FC = () => {
    const { expenses, currentUser } = useExpense();
    const [statusFilter, setStatusFilter] = useState<ExpenseStatus | 'ALL'>('ALL');
    const [dateFilter, setDateFilter] = useState('');

    const filteredExpenses = useMemo(() => {
        // First filter by user role
        let roleFilteredExpenses = expenses;
        if (currentUser) {
            if (currentUser.role === 'EMPLOYEE') {
                // Employees can only see their own expenses
                roleFilteredExpenses = expenses.filter(expense => expense.employeeId === currentUser.id);
            } else if (currentUser.role === 'MANAGER') {
                // Managers can see their own expenses and their team's expenses
                // In a real app, you would have a proper team structure
                // For now, we'll just show all expenses as a manager
                roleFilteredExpenses = expenses;
            }
            // Admins can see all expenses by default
        }

        // Then apply status and date filters
        return roleFilteredExpenses.filter(expense => {
            const matchesStatus = statusFilter === 'ALL' || expense.status === statusFilter;
            const matchesDate = !dateFilter || expense.date === dateFilter;
            return matchesStatus && matchesDate;
        });
    }, [expenses, statusFilter, dateFilter, currentUser]);

    const getEmployeeName = (employeeId: string) => {
        return mockUsers.find(user => user.id === employeeId)?.name || 'Unknown Employee';
    };

    const getPolicyName = (policyId: string) => {
        return mockPolicies.find(policy => policy.id === policyId)?.name || 'Unknown Policy';
    };

    const getExpenseTypeName = (expenseTypeId: string) => {
        return mockExpenseTypes.find(type => type.id === expenseTypeId)?.name || 'Unknown Type';
    };

    // Function to calculate total amount for a report
    const getTotalAmount = (expense: ExpenseReport) => {
        return expense.expenses.reduce((sum, item) => sum + item.amount, 0);
    };

    const statistics = useMemo(() => {
        const stats = {
            totalAmount: 0,
            byPolicy: {} as Record<string, number>,
            byStatus: {} as Record<string, number>,
            byEmployee: {} as Record<string, number>,
            byExpenseType: {} as Record<string, number>
        };

        filteredExpenses.forEach(expense => {
            const totalAmount = getTotalAmount(expense);
            stats.totalAmount += totalAmount;
            
            // By policy
            const policyName = getPolicyName(expense.policyId);
            stats.byPolicy[policyName] = (stats.byPolicy[policyName] || 0) + totalAmount;
            
            // By status
            stats.byStatus[expense.status] = (stats.byStatus[expense.status] || 0) + totalAmount;
            
            // By employee
            stats.byEmployee[expense.employeeId] = (stats.byEmployee[expense.employeeId] || 0) + totalAmount;

            // By expense type - now we need to handle multiple expense types per report
            expense.expenses.forEach(item => {
                const expenseTypeName = getExpenseTypeName(item.expenseTypeId);
                stats.byExpenseType[expenseTypeName] = (stats.byExpenseType[expenseTypeName] || 0) + item.amount;
            });
        });

        return stats;
    }, [filteredExpenses]);

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as ExpenseStatus | 'ALL')}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="REIMBURSED">Reimbursed</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Date
                        </label>
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Expense List */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Expense List</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Employee
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Expense Types
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredExpenses.map((expense: ExpenseReport) => (
                                <tr key={expense.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {getEmployeeName(expense.employeeId)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(expense.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="space-y-1">
                                            {expense.expenses.map((item, index) => (
                                                <div key={index}>
                                                    <span className="font-medium">{getExpenseTypeName(item.expenseTypeId)}</span>
                                                    <span className="text-gray-400 ml-2">₹{item.amount.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ₹{getTotalAmount(expense).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                            ${expense.status === 'APPROVED' ? 'bg-green-100 text-green-800' : ''}
                                            ${expense.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                                            ${expense.status === 'REJECTED' ? 'bg-red-100 text-red-800' : ''}
                                            ${expense.status === 'REIMBURSED' ? 'bg-blue-100 text-blue-800' : ''}
                                        `}>
                                            {expense.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ExpenseReports; 