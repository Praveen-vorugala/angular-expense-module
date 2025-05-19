import React, { useState } from 'react';
import { useExpense } from '../store/ExpenseContext';
import { ExpenseReport, mockUsers } from '../types/expense';

const ExpenseApproval: React.FC = () => {
    const { expenses, updateExpenseStatus, policies, expenseTypes } = useExpense();
    const [rejectionReason, setRejectionReason] = useState<string>('');
    const [selectedExpense, setSelectedExpense] = useState<ExpenseReport | null>(null);

    const pendingExpenses = expenses.filter(expense => expense.status === 'PENDING');

    const getEmployeeName = (employeeId: string) => {
        return mockUsers.find(user => user.id === employeeId)?.name || 'Unknown Employee';
    };

    const getPolicyName = (policyId: string) => {
        return policies.find(policy => policy.id === policyId)?.name || 'Unknown Policy';
    };

    const getExpenseTypeName = (expenseTypeId: string) => {
        return expenseTypes.find(type => type.id === expenseTypeId)?.name || 'Unknown Type';
    };

    const handleApprove = (expense: ExpenseReport) => {
        updateExpenseStatus(expense.id, 'APPROVED');
    };

    const handleReject = (expense: ExpenseReport) => {
        if (!rejectionReason) return;
        updateExpenseStatus(expense.id, 'REJECTED', rejectionReason);
        setRejectionReason('');
        setSelectedExpense(null);
    };

    const getExpenseDetails = (expense: ExpenseReport) => {
        const policy = policies.find(p => p.id === expense.policyId);
        return {
            policyName: policy?.name || 'Unknown Policy',
            totalAmount: expense.expenses.reduce((sum, item) => sum + item.amount, 0)
        };
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Pending Expenses</h2>
            <div className="space-y-6">
                {pendingExpenses.map(expense => {
                    const details = getExpenseDetails(expense);
                    return (
                        <div key={expense.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-medium">
                                        {getEmployeeName(expense.employeeId)}
                                    </h3>
                                    <div className="mt-2 space-y-1 text-sm text-gray-500">
                                        <p>Policy: {details.policyName}</p>
                                        <p>Total Amount: ₹{details.totalAmount.toFixed(2)}</p>
                                        <p>Date: {new Date(expense.date).toLocaleDateString()}</p>
                                        <div className="mt-2">
                                            <p className="font-medium">Expense Items:</p>
                                            {expense.expenses.map((item, index) => (
                                                <div key={index} className="ml-4 mt-1">
                                                    <p>Type: {getExpenseTypeName(item.expenseTypeId)}</p>
                                                    <p>Amount: ₹{item.amount.toFixed(2)}</p>
                                                    <p>Description: {item.description}</p>
                                                    <p>
                                                        <a
                                                            href={item.receiptUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-indigo-600 hover:text-indigo-500"
                                                        >
                                                            View Receipt
                                                        </a>
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="ml-4 flex space-x-2">
                                    <button
                                        onClick={() => handleApprove(expense)}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => setSelectedExpense(expense)}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>

                            {selectedExpense?.id === expense.id && (
                                <div className="mt-4">
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Enter reason for rejection"
                                        rows={3}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                    <div className="mt-2 flex space-x-2">
                                        <button
                                            onClick={() => handleReject(expense)}
                                            disabled={!rejectionReason}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            Confirm Rejection
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedExpense(null);
                                                setRejectionReason('');
                                            }}
                                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {pendingExpenses.length === 0 && (
                    <p className="text-center text-gray-500">No pending expenses to approve</p>
                )}
            </div>
        </div>
    );
};

export default ExpenseApproval; 