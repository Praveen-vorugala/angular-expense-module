import { UserProperty } from '../types/user';

class UserPropertiesService {
  private baseUrl = '/api/user-properties';

  async getAllProperties(): Promise<UserProperty[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch user properties');
    }
    return response.json();
  }

  async addProperty(property: Omit<UserProperty, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProperty> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(property),
    });
    if (!response.ok) {
      throw new Error('Failed to add user property');
    }
    return response.json();
  }

  async deleteProperty(propertyId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${propertyId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete user property');
    }
  }

  async updateProperty(
    propertyId: string,
    property: Partial<Omit<UserProperty, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<UserProperty> {
    const response = await fetch(`${this.baseUrl}/${propertyId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(property),
    });
    if (!response.ok) {
      throw new Error('Failed to update user property');
    }
    return response.json();
  }
}

export const userPropertiesService = new UserPropertiesService(); 