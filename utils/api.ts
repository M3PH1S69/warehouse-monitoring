const API_BASE_URL = '../../backend/api';

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: {
    id: number;
    name: string;
    username: string;
    role: string;
  };
  message?: string;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth.php', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Device API methods
  async getDevices() {
    return this.request<any[]>('/devices.php');
  }

  async createDevice(device: any) {
    return this.request<ApiResponse<any>>('/devices.php', {
      method: 'POST',
      body: JSON.stringify(device),
    });
  }

  async updateDevice(device: any) {
    return this.request<ApiResponse<any>>('/devices.php', {
      method: 'PUT',
      body: JSON.stringify(device),
    });
  }

  async deleteDevice(id: string) {
    return this.request<ApiResponse<any>>(`/devices.php?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Category API methods
  async getCategories() {
    return this.request<any[]>('/categories.php');
  }

  async createCategory(category: any) {
    return this.request<ApiResponse<any>>('/categories.php', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  async updateCategory(category: any) {
    return this.request<ApiResponse<any>>('/categories.php', {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  }

  async deleteCategory(id: number) {
    return this.request<ApiResponse<any>>(`/categories.php?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Transaction API methods
  async getTransactions() {
    return this.request<any[]>('/transactions.php');
  }

  async createTransaction(transaction: any) {
    return this.request<ApiResponse<any>>('/transactions.php', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  // User API methods
  async getUsers() {
    return this.request<any[]>('/users.php');
  }

  async createUser(user: any) {
    return this.request<ApiResponse<any>>('/users.php', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async updateUser(user: any) {
    return this.request<ApiResponse<any>>('/users.php', {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }

  async deleteUser(id: number) {
    return this.request<ApiResponse<any>>(`/users.php?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard stats (using stored procedure)
  async getDashboardStats() {
    // Since we don't have a specific endpoint for dashboard stats,
    // we'll calculate them from the existing data
    const [devices, transactions] = await Promise.all([
      this.getDevices(),
      this.getTransactions()
    ]);

    const totalItems = devices.reduce((sum: number, device: any) => sum + device.quantity, 0);
    const lowStockItems = devices.filter((d: any) => d.status === 'Low Stock').length;
    const outOfStockItems = devices.filter((d: any) => d.status === 'Out of Stock').length;
    const normalItems = devices.filter((d: any) => d.condition === 'Normal').reduce((sum: number, device: any) => sum + device.quantity, 0);
    const damagedItems = devices.filter((d: any) => d.condition === 'Rusak').reduce((sum: number, device: any) => sum + device.quantity, 0);
    
    // Recent transactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTransactions = transactions.filter((t: any) => new Date(t.date) >= thirtyDaysAgo);
    
    const itemsOut = recentTransactions.filter((t: any) => t.type === 'out').reduce((sum: number, t: any) => sum + t.quantity, 0);
    const itemsIn = recentTransactions.filter((t: any) => t.type === 'in').reduce((sum: number, t: any) => sum + t.quantity, 0);

    return {
      totalItems,
      lowStockItems,
      outOfStockItems,
      normalItems,
      damagedItems,
      itemsOut,
      itemsIn,
      recentTransactions: recentTransactions.length
    };
  }
}

export const apiService = new ApiService();
