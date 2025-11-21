import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { authService } from '@/lib/auth';
import type { User, LoginCredentials, RegisterData } from '@/types';

export const useAuth = () => {
  const { user, isAuthenticated, login: storeLogin, logout: storeLogout } = useAppStore();
  const [loading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated() && !user) {
        try {
          setLocalLoading(true);
          const userData = await authService.getProfile();
          storeLogin(userData);
        } catch (err) {
          console.error('Failed to get user profile:', err);
          authService.logout();
        } finally {
          setLocalLoading(false);
        }
      }
    };

    checkAuth();
  }, [user, storeLogin]);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLocalLoading(true);
      setError(null);
      const { user: userData } = await authService.login(credentials);
      storeLogin(userData);
      return userData;
    } catch (err: unknown) {
      console.error('Login error:', err);
      // Handle both Error objects and axios errors
      let errorMessage = 'Login failed';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        const error = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
        errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Login failed';
      }
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLocalLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLocalLoading(true);
      setError(null);
      const { user: userData } = await authService.register(data);
      storeLogin(userData);
      return userData;
    } catch (err: unknown) {
      console.error('Registration error:', err);
      // Handle both Error objects and axios errors
      let errorMessage = 'Registration failed';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        const error = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
        errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Registration failed';
      }
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLocalLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    storeLogout();
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      setLocalLoading(true);
      setError(null);
      const updatedUser = await authService.updateProfile(data);
      storeLogin(updatedUser);
      return updatedUser;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLocalLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setLocalLoading(true);
      setError(null);
      await authService.changePassword(currentPassword, newPassword);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Password change failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLocalLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
  };
};
