import React from 'react';
import { Navigate } from 'react-router-dom';
import { useExpense } from '../store/ExpenseContext';
import DropdownManagement from '../components/DropdownManagement';

const DropdownTypesPage: React.FC = () => {
    const { currentUser, dropdownTypes, addDropdownType, updateDropdownType, addDropdownOption, updateDropdownOption } = useExpense();

    // Redirect if user is not admin
    if (!currentUser || currentUser.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 sm:px-0">
                <h1 className="text-2xl font-semibold text-gray-900">Dropdown Types Management</h1>
                <p className="mt-2 text-sm text-gray-700">
                    Manage custom dropdown types and their options that can be used across the application.
                </p>
            </div>
            <div className="mt-6">
                <DropdownManagement
                    dropdownTypes={dropdownTypes}
                    onAddDropdownType={addDropdownType}
                    onUpdateDropdownType={updateDropdownType}
                    onAddOption={addDropdownOption}
                    onUpdateOption={updateDropdownOption}
                />
            </div>
        </div>
    );
};

export default DropdownTypesPage; 