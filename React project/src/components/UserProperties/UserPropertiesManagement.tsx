import React, { useState } from 'react';
import { UserProperty } from '../../types/user';

interface UserPropertiesManagementProps {
  userProperties: UserProperty[];
  onAddProperty: (property: Omit<UserProperty, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteProperty: (propertyId: string) => void;
}

const UserPropertiesManagement: React.FC<UserPropertiesManagementProps> = ({
  userProperties,
  onAddProperty,
  onDeleteProperty,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProperty, setNewProperty] = useState<{
    name: string;
    type: 'ROLE' | 'GRADE' | 'POSITION';
    value: string;
  }>({
    name: '',
    type: 'ROLE',
    value: '',
  });

  // Group properties by type
  const groupedProperties = userProperties.reduce((acc, property) => {
    if (!acc[property.type]) {
      acc[property.type] = [];
    }
    acc[property.type].push(property);
    return acc;
  }, {} as Record<string, UserProperty[]>);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProperty(newProperty);
    setNewProperty({ name: '', type: 'ROLE', value: '' });
    setShowAddModal(false);
  };

  const PropertySection = ({ title, properties }: { title: string; properties: UserProperty[] }) => (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.map((property) => (
          <div
            key={property.id}
            className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center"
          >
            <div>
              <p className="font-medium text-gray-800">{property.name}</p>
              <p className="text-sm text-gray-600">Value: {property.value}</p>
            </div>
            <button
              onClick={() => onDeleteProperty(property.id)}
              className="text-red-500 hover:text-red-700 ml-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add Property
        </button>
      </div>

      {/* Display grouped properties */}
      {groupedProperties['ROLE'] && (
        <PropertySection title="Roles" properties={groupedProperties['ROLE']} />
      )}
      {groupedProperties['GRADE'] && (
        <PropertySection title="Grades" properties={groupedProperties['GRADE']} />
      )}
      {groupedProperties['POSITION'] && (
        <PropertySection title="Positions" properties={groupedProperties['POSITION']} />
      )}

      {/* Add Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Add New Property</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={newProperty.name}
                  onChange={(e) =>
                    setNewProperty({ ...newProperty, name: e.target.value })
                  }
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={newProperty.type}
                  onChange={(e) =>
                    setNewProperty({
                      ...newProperty,
                      type: e.target.value as 'ROLE' | 'GRADE' | 'POSITION',
                    })
                  }
                  className="w-full border rounded p-2"
                >
                  <option value="ROLE">Role</option>
                  <option value="GRADE">Grade</option>
                  <option value="POSITION">Position</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Value</label>
                <input
                  type="text"
                  value={newProperty.value}
                  onChange={(e) =>
                    setNewProperty({ ...newProperty, value: e.target.value })
                  }
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPropertiesManagement; 