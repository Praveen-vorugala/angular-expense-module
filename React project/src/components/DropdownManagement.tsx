import React, { useState } from 'react';
import { DropdownType, DropdownOption } from '../types/expense';

interface DropdownManagementProps {
    dropdownTypes: DropdownType[];
    onAddDropdownType: (type: Omit<DropdownType, 'id'>) => void;
    onUpdateDropdownType: (type: DropdownType) => void;
    onAddOption: (typeId: string, option: Omit<DropdownOption, 'id'>) => void;
    onUpdateOption: (typeId: string, option: DropdownOption) => void;
}

const DropdownManagement: React.FC<DropdownManagementProps> = ({
    dropdownTypes,
    onAddDropdownType,
    onUpdateDropdownType,
    onAddOption,
    onUpdateOption
}) => {
    const [showNewTypeForm, setShowNewTypeForm] = useState(false);
    const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
    const [newType, setNewType] = useState<Omit<DropdownType, 'id'>>({
        name: '',
        description: '',
        options: [],
        isActive: true
    });
    const [showOptionForm, setShowOptionForm] = useState<string | null>(null);
    const [newOption, setNewOption] = useState<Omit<DropdownOption, 'id'>>({
        value: '',
        isActive: true
    });

    const handleAddType = () => {
        onAddDropdownType(newType);
        setNewType({
            name: '',
            description: '',
            options: [],
            isActive: true
        });
        setShowNewTypeForm(false);
    };

    const handleAddOption = (typeId: string) => {
        onAddOption(typeId, newOption);
        setNewOption({
            value: '',
            isActive: true
        });
        setShowOptionForm(null);
    };

    const handleToggleOptionStatus = (typeId: string, option: DropdownOption) => {
        onUpdateOption(typeId, {
            ...option,
            isActive: !option.isActive
        });
    };

    const handleToggleTypeStatus = (type: DropdownType) => {
        onUpdateDropdownType({
            ...type,
            isActive: !type.isActive
        });
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Manage Dropdown Types</h2>
                <button
                    onClick={() => setShowNewTypeForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Add New Type
                </button>
            </div>

            {/* New Type Form */}
            {showNewTypeForm && (
                <div className="mb-6 bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-medium mb-4">Add New Dropdown Type</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                value={newType.name}
                                onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Enter type name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <input
                                type="text"
                                value={newType.description}
                                onChange={(e) => setNewType({ ...newType, description: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Enter description"
                            />
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleAddType}
                                disabled={!newType.name}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Add Type
                            </button>
                            <button
                                onClick={() => setShowNewTypeForm(false)}
                                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dropdown Types List */}
            <div className="space-y-6">
                {dropdownTypes.map(type => (
                    <div key={type.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-medium">{type.name}</h3>
                                <p className="text-sm text-gray-500">{type.description}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleToggleTypeStatus(type)}
                                    className={`inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded-md ${
                                        type.isActive
                                            ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                                            : 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                                    }`}
                                >
                                    {type.isActive ? 'Active' : 'Inactive'}
                                </button>
                                <button
                                    onClick={() => setShowOptionForm(type.id)}
                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Add Option
                                </button>
                            </div>
                        </div>

                        {/* Option Form */}
                        {showOptionForm === type.id && (
                            <div className="mb-4 bg-gray-50 p-4 rounded-md">
                                <div className="flex items-end space-x-4">
                                    <div className="flex-grow">
                                        <label className="block text-sm font-medium text-gray-700">Option Value</label>
                                        <input
                                            type="text"
                                            value={newOption.value}
                                            onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            placeholder="Enter option value"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleAddOption(type.id)}
                                        disabled={!newOption.value}
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        Add
                                    </button>
                                    <button
                                        onClick={() => setShowOptionForm(null)}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Options List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {type.options.map(option => (
                                <div
                                    key={option.id}
                                    className="flex justify-between items-center p-2 bg-gray-50 rounded-md"
                                >
                                    <span className="text-sm text-gray-900">{option.value}</span>
                                    <button
                                        onClick={() => handleToggleOptionStatus(type.id, option)}
                                        className={`inline-flex items-center px-2 py-1 border text-xs font-medium rounded-md ${
                                            option.isActive
                                                ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                                                : 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                                        }`}
                                    >
                                        {option.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DropdownManagement; 