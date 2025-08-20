import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

interface CompanyAwareRequestConfig extends AxiosRequestConfig {
  requireCompanyAccess?: boolean;
  bypassCompanyCheck?: boolean;
}

class CompanyAwareApiService {
  private baseURL: string;
  
  constructor() {
    this.baseURL = 'http://localhost:3001/api/v1';
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private getCurrentUser() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;
      
      // Decode JWT to get user info (simple decode, not verification)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  }

  private validateCompanyAccess(targetCompanyId?: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Super admin can access everything
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // If no target company specified, allow (will be filtered by backend)
    if (!targetCompanyId) {
      return true;
    }

    // Check if user can access the target company
    return user.companyId === targetCompanyId;
  }

  private addCompanyFilter(config: CompanyAwareRequestConfig = {}): AxiosRequestConfig {
    const user = this.getCurrentUser();
    
    // Don't add company filter for super admin or if bypassed
    if (config.bypassCompanyCheck || user?.role === 'SUPER_ADMIN') {
      return {
        ...config,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...config.headers,
        },
      };
    }

    // Add company filter for regular users
    const companyFilter = user?.companyId ? { companyId: user.companyId } : {};
    
    return {
      ...config,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...config.headers,
      },
      params: {
        ...companyFilter,
        ...config.params,
      },
    };
  }

  // GET request with company awareness
  async get<T = any>(
    url: string, 
    config: CompanyAwareRequestConfig = {}
  ): Promise<AxiosResponse<T>> {
    // Check company access if required
    if (config.requireCompanyAccess) {
      const targetCompanyId = config.params?.companyId;
      if (!this.validateCompanyAccess(targetCompanyId)) {
        throw new Error('ليس لديك صلاحية للوصول لهذه الشركة');
      }
    }

    const finalConfig = this.addCompanyFilter(config);
    return axios.get(`${this.baseURL}${url}`, finalConfig);
  }

  // POST request with company awareness
  async post<T = any>(
    url: string, 
    data?: any, 
    config: CompanyAwareRequestConfig = {}
  ): Promise<AxiosResponse<T>> {
    const user = this.getCurrentUser();
    
    // Add companyId to data for regular users
    if (data && user?.companyId && user.role !== 'SUPER_ADMIN' && !config.bypassCompanyCheck) {
      data = {
        ...data,
        companyId: user.companyId,
      };
    }

    // Check company access if required
    if (config.requireCompanyAccess) {
      const targetCompanyId = data?.companyId;
      if (!this.validateCompanyAccess(targetCompanyId)) {
        throw new Error('ليس لديك صلاحية للوصول لهذه الشركة');
      }
    }

    const finalConfig = this.addCompanyFilter(config);
    return axios.post(`${this.baseURL}${url}`, data, finalConfig);
  }

  // PUT request with company awareness
  async put<T = any>(
    url: string, 
    data?: any, 
    config: CompanyAwareRequestConfig = {}
  ): Promise<AxiosResponse<T>> {
    const user = this.getCurrentUser();
    
    // Add companyId to data for regular users
    if (data && user?.companyId && user.role !== 'SUPER_ADMIN' && !config.bypassCompanyCheck) {
      data = {
        ...data,
        companyId: user.companyId,
      };
    }

    // Check company access if required
    if (config.requireCompanyAccess) {
      const targetCompanyId = data?.companyId;
      if (!this.validateCompanyAccess(targetCompanyId)) {
        throw new Error('ليس لديك صلاحية للوصول لهذه الشركة');
      }
    }

    const finalConfig = this.addCompanyFilter(config);
    return axios.put(`${this.baseURL}${url}`, data, finalConfig);
  }

  // DELETE request with company awareness
  async delete<T = any>(
    url: string, 
    config: CompanyAwareRequestConfig = {}
  ): Promise<AxiosResponse<T>> {
    // Check company access if required
    if (config.requireCompanyAccess) {
      const targetCompanyId = config.params?.companyId;
      if (!this.validateCompanyAccess(targetCompanyId)) {
        throw new Error('ليس لديك صلاحية للوصول لهذه الشركة');
      }
    }

    const finalConfig = this.addCompanyFilter(config);
    return axios.delete(`${this.baseURL}${url}`, finalConfig);
  }

  // Helper methods for common operations
  async getConversations(filters: any = {}) {
    return this.get('/conversations', { params: filters });
  }

  async getCustomers(filters: any = {}) {
    return this.get('/customers', { params: filters });
  }

  async getProducts(filters: any = {}) {
    return this.get('/products', { params: filters });
  }

  async getOrders(filters: any = {}) {
    return this.get('/orders', { params: filters });
  }

  // Company-specific operations
  async getCurrentCompany() {
    return this.get('/companies/current');
  }

  async getCompanyStats() {
    return this.get('/companies/current/stats');
  }

  // Admin operations (bypass company check)
  async getAllCompanies() {
    return this.get('/admin/companies', { bypassCompanyCheck: true });
  }

  async getCompanyById(companyId: string) {
    return this.get(`/admin/companies/${companyId}`, { 
      bypassCompanyCheck: true,
      requireCompanyAccess: true,
      params: { companyId }
    });
  }

  // Utility methods
  isCurrentUserSuperAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'SUPER_ADMIN';
  }

  getCurrentCompanyId(): string | null {
    const user = this.getCurrentUser();
    return user?.companyId || null;
  }

  canAccessCompany(companyId: string): boolean {
    return this.validateCompanyAccess(companyId);
  }
}

// Create singleton instance
export const companyAwareApi = new CompanyAwareApiService();

// Export class for custom instances
export default CompanyAwareApiService;
