import React, { useState } from 'react';
import { UserProperty } from '../types/user';

interface PropertyValue {
    id: string;
    value: string;
    name: string;
}

interface PropertyType {
    id: string;
    name: string;
    type: string;
    values: PropertyValue[];
    createdAt: Date;
    updatedAt: Date;
}

// Mock data reorganized by property types
const MOCK_PROPERTIES: PropertyType[] = [
    {
        id: '1',
        name: 'Role',
        type: 'ROLE',
        values: [
            { id: '1-1', value: 'EMPLOYEE', name: 'Employee Role' },
            { id: '1-2', value: 'MANAGER', name: 'Manager Role' }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: '2',
        name: 'Grade',
        type: 'GRADE',
        values: [
            { id: '2-1', value: 'MS1', name: 'Grade MS1' },
            { id: '2-2', value: 'MS2', name: 'Grade MS2' },
            { id: '2-3', value: 'MS3', name: 'Grade MS3' },
            { id: '2-4', value: 'MS4', name: 'Grade MS4' }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: '3',
        name: 'Position',
        type: 'POSITION',
        values: [
            { id: '3-1', value: 'FULLTIME', name: 'Full-time Position' },
            { id: '3-2', value: 'PROBATION', name: 'Probation Position' }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

const UserPropertiesPage: React.FC = () => {
    const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>(MOCK_PROPERTIES);
    const [error, setError] = useState<string | null>(null);
    const [showAddPropertyType, setShowAddPropertyType] = useState(false);
    const [showAddPropertyValue, setShowAddPropertyValue] = useState<string | null>(null);
    const [newPropertyType, setNewPropertyType] = useState({ name: '', type: '' });
    const [newPropertyValue, setNewPropertyValue] = useState({ name: '', value: '' });

    const handleAddPropertyType = () => {
        if (!newPropertyType.name || !newPropertyType.type) {
            setError('Please fill in all fields');
            return;
        }

        const newType: PropertyType = {
            id: String(Date.now()),
            name: newPropertyType.name,
            type: newPropertyType.type.toUpperCase(),
            values: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        setPropertyTypes([...propertyTypes, newType]);
        setNewPropertyType({ name: '', type: '' });
        setShowAddPropertyType(false);
        setError(null);
    };

    const handleAddPropertyValue = (propertyTypeId: string) => {
        if (!newPropertyValue.name || !newPropertyValue.value) {
            setError('Please fill in all fields');
            return;
        }

        const updatedTypes = propertyTypes.map(type => {
            if (type.id === propertyTypeId) {
                return {
                    ...type,
                    values: [...type.values, {
                        id: `${type.id}-${type.values.length + 1}`,
                        name: newPropertyValue.name,
                        value: newPropertyValue.value.toUpperCase()
                    }]
                };
            }
            return type;
        });

        setPropertyTypes(updatedTypes);
        setNewPropertyValue({ name: '', value: '' });
        setShowAddPropertyValue(null);
        setError(null);
    };

    const handleDeletePropertyType = (typeId: string) => {
        setPropertyTypes(propertyTypes.filter(type => type.id !== typeId));
    };

    const handleDeletePropertyValue = (typeId: string, valueId: string) => {
        const updatedTypes = propertyTypes.map(type => {
            if (type.id === typeId) {
                return {
                    ...type,
                    values: type.values.filter(value => value.id !== valueId)
                };
            }
            return type;
        });
        setPropertyTypes(updatedTypes);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    {error}
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">User Properties</h1>
                <button
                    onClick={() => setShowAddPropertyType(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                    Add Property Type
                </button>
            </div>

            {showAddPropertyType && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h2 className="text-lg font-medium mb-4">Add New Property Type</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                value={newPropertyType.name}
                                onChange={(e) => setNewPropertyType({ ...newPropertyType, name: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type</label>
                            <input
                                type="text"
                                value={newPropertyType.type}
                                onChange={(e) => setNewPropertyType({ ...newPropertyType, type: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="e.g., ROLE, GRADE, POSITION"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end space-x-3">
                        <button
                            onClick={() => setShowAddPropertyType(false)}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddPropertyType}
                            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                        >
                            Add Type
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {propertyTypes.map(propertyType => (
                    <div key={propertyType.id} className="bg-white shadow rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-semibold">{propertyType.name}</h2>
                                <p className="text-sm text-gray-500">Type: {propertyType.type}</p>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowAddPropertyValue(propertyType.id)}
                                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                >
                                    Add Value
                                </button>
                                <button
                                    onClick={() => handleDeletePropertyType(propertyType.id)}
                                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                >
                                    Delete Type
                                </button>
                            </div>
                        </div>

                        {showAddPropertyValue === propertyType.id && (
                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                <h3 className="text-md font-medium mb-3">Add New Value</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Display Name</label>
                                        <input
                                            type="text"
                                            value={newPropertyValue.name}
                                            onChange={(e) => setNewPropertyValue({ ...newPropertyValue, name: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            placeholder="e.g., Senior Manager"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Value</label>
                                        <input
                                            type="text"
                                            value={newPropertyValue.value}
                                            onChange={(e) => setNewPropertyValue({ ...newPropertyValue, value: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            placeholder="e.g., SENIOR_MANAGER"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end space-x-3">
                                    <button
                                        onClick={() => setShowAddPropertyValue(null)}
                                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleAddPropertyValue(propertyType.id)}
                                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                    >
                                        Add Value
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mt-4">
                            <h3 className="text-lg font-medium mb-2">Values</h3>
                            <div className="grid grid-cols-1 gap-2">
                                {propertyType.values.map(value => (
                                    <div
                                        key={value.id}
                                        className="flex justify-between items-center bg-gray-50 p-3 rounded"
                                    >
                                        <div>
                                            <span className="font-medium">{value.name}</span>
                                            <span className="text-sm text-gray-500 ml-2">({value.value})</span>
                                        </div>
                                        <button
                                            onClick={() => handleDeletePropertyValue(propertyType.id, value.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserPropertiesPage; 