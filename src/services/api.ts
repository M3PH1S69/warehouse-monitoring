// API service for warehouse monitoring system
const API_BASE_URL = '../../backend/api';

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'administrator' | 'view_only';
  };
}

export interface UserDto {
  id: number;
  name: string;
  email: string;
  role: 'administrator' | 'view_only';
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`HTTP error! status: ${response.status}${text ? `, body: ${text}` : ''}`);
      }
      
      const data = (await response.json()) as T;
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Users
  async getUsers(): Promise<UserDto[]> {
    return this.request<UserDto[]>('/users.php');
  }

  async createUser(userData: unknown) {
    return this.request('/users.php', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userData: unknown) {
    return this.request('/users.php', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: number) {
    return this.request(`/users.php?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Categories
  async getCategories() {
    return this.request('/categories.php');
  }

  async createCategory(categoryData: unknown) {
    return this.request('/categories.php', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(categoryData: unknown) {
    return this.request('/categories.php', {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id: string | number) {
    return this.request(`/categories.php?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Devices
  async getDevices() {
    return this.request('/devices.php');
  }

  async createDevice(deviceData: unknown) {
    return this.request('/devices.php', {
      method: 'POST',
      body: JSON.stringify(deviceData),
    });
  }

  async updateDevice(deviceData: unknown) {
    return this.request('/devices.php', {
      method: 'PUT',
      body: JSON.stringify(deviceData),
    });
  }

  async deleteDevice(id: string) {
    return this.request(`/devices.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  // Transactions
  async getTransactions() {
    return this.request('/transactions.php');
  }

  async createTransaction(txData: unknown) {
    return this.request('/transactions.php', {
      method: 'POST',
      body: JSON.stringify(txData),
    });
  }
}

export const apiService = new ApiService();