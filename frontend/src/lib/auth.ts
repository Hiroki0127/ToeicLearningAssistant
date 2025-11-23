import api from './api';
import type { User } from '@/types';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Authentication service functions
export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Check if response has success field (error response)
      if (response.data.success === false) {
        throw new Error(response.data.message || response.data.error || 'Login failed');
      }
      
      const { user, token } = response.data.data;
      
      // Store token in localStorage
      localStorage.setItem('auth-token', token);
      
      return { user, token };
    } catch (error: any) {
      // Handle axios errors
      if (error.response?.data) {
        const errorMessage = error.response.data.message || error.response.data.error || 'Login failed';
        throw new Error(errorMessage);
      }
      throw error;
    }
  },

  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/register', data);
      
      // Check if response has success field (error response)
      if (response.data.success === false) {
        throw new Error(response.data.message || response.data.error || 'Registration failed');
      }
      
      const { user, token } = response.data.data;
      
      // Store token in localStorage
      localStorage.setItem('auth-token', token);
      
      return { user, token };
    } catch (error: any) {
      // Handle axios errors
      if (error.response?.data) {
        const errorMessage = error.response.data.message || error.response.data.error || 'Registration failed';
        throw new Error(errorMessage);
      }
      throw error;
    }
  },

  // Get current user profile
  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile');
    return response.data.data;
  },

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put('/auth/profile', data);
    return response.data.data;
  },

  // Change password (requires authentication)
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  // Reset password (no authentication required, uses email)
  async resetPassword(email: string, newPassword: string): Promise<void> {
    const response = await api.post('/auth/reset-password', {
      email,
      newPassword,
    });
    if (response.data.success === false) {
      throw new Error(response.data.message || response.data.error || 'Password reset failed');
    }
  },

  // Logout user
  logout(): void {
    localStorage.removeItem('auth-token');
    // Redirect to login page
    window.location.href = '/login';
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth-token');
  },

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('auth-token');
  },
};
