import React, { useState } from 'react';
import { useExpense } from '../store/ExpenseContext';
import { ExpenseType, ExpenseCategory } from '../types/expense';

const ExpenseTypeManagement: React.FC = () => {
    const { expenseTypes, addExpenseType, updateExpenseType, toggleExpenseTypeStatus } = useExpense();
    const [editingType, setEditingType] = useState<ExpenseType | null>(null);
    const [newType, setNewType] = useState<Partial<ExpenseType>>({
        name: '',
        description: '',
        category: 'FIELDWORK',
        isActive: true
    });

    const availableCategories: ExpenseCategory[] = ['FIELDWORK', 'MEALS', 'LODGING', 'OTHER','ADMIN'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingType) {
            updateExpenseType(editingType);
        } else if (newType.name && newType.description && newType.category) {
            addExpenseType({
                name: newType.name,
                description: newType.description,
                category: newType.category,
                isActive: true
            });
        }

        // Reset form
        setEditingType(null);
        setNewType({
            name: '',
            description: '',
            category: 'FIELDWORK',
            isActive: true
        });
    };

    const isFormValid = () => {
        const type = editingType || newType;
        return type.name && type.description && type.category;
    };

    return (
        <div className="space-y-6">
            {/* Expense Type List */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6">Expense Types</h2>
                <div className="space-y-4">
                    {expenseTypes.map(type => (
                        <div
                            key={type.id}
                            className="border rounded-lg p-4 hover:bg-gray-50"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-grow">
                                    <div className="flex items-center">
                                        <h3 className="text-lg font-medium">{type.name}</h3>
                                        <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            type.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {type.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {type.category}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {type.description}
                                    </p>
                                </div>
                                <div className="ml-4 flex space-x-2">
                                    <button
                                        onClick={() => setEditingType(type)}
                                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => toggleExpenseTypeStatus(type.id)}
                                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                            type.isActive 
                                                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                                : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                        }`}
                                    >
                                        {type.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add/Edit Form */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">
                    {editingType ? 'Edit Expense Type' : 'Add New Expense Type'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Name
                        </label>
                        <input
                            type="text"
                            value={editingType?.name || newType.name}
                            onChange={(e) => {
                                if (editingType) {
                                    setEditingType({
                                        ...editingType,
                                        name: e.target.value
                                    });
                                } else {
                                    setNewType({
                                        ...newType,
                                        name: e.target.value
                                    });
                                }
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Category
                        </label>
                        <select
                            value={editingType?.category || newType.category}
                            onChange={(e) => {
                                if (editingType) {
                                    setEditingType({
                                        ...editingType,
                                        category: e.target.value as ExpenseCategory
                                    });
                                } else {
                                    setNewType({
                                        ...newType,
                                        category: e.target.value as ExpenseCategory
                                    });
                                }
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        >
                            {availableCategories.map(category => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            value={editingType?.description || newType.description}
                            onChange={(e) => {
                                if (editingType) {
                                    setEditingType({
                                        ...editingType,
                                        description: e.target.value
                                    });
                                } else {
                                    setNewType({
                                        ...newType,
                                        description: e.target.value
                                    });
                                }
                            }}
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        />
                    </div>

                    <div className="flex space-x-3">
                        <button
                            type="submit"
                            disabled={!isFormValid()}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {editingType ? 'Save Changes' : 'Add Expense Type'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setEditingType(null);
                                setNewType({
                                    name: '',
                                    description: '',
                                    category: 'FIELDWORK',
                                    isActive: true
                                });
                            }}
                            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExpenseTypeManagement; 