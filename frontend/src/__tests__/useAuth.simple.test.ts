import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';

// Mock the auth service
jest.mock('@/lib/auth', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: jest.fn(),
    getProfile: jest.fn(),
  },
}));

// Mock the store
jest.mock('@/lib/store', () => ({
  useAppStore: () => ({
    user: null,
    isAuthenticated: false,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
});

describe('useAuth Hook - Simple Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should initialize with no user when not authenticated', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it('should handle login with correct parameters', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    const mockCredentials = { email: 'test@example.com', password: 'password123' };
    
    const { authService } = require('@/lib/auth');
    const { useAppStore } = require('@/lib/store');
    
    authService.login.mockResolvedValue({ user: mockUser, token: 'mock-token' });
    const mockStoreLogin = jest.fn();
    useAppStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: mockStoreLogin,
      logout: jest.fn(),
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login(mockCredentials);
    });

    expect(authService.login).toHaveBeenCalledWith(mockCredentials);
    expect(mockStoreLogin).toHaveBeenCalledWith(mockUser);
  });

  it('should handle registration with correct parameters', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    const mockRegisterData = { 
      name: 'Test User', 
      email: 'test@example.com', 
      password: 'password123' 
    };
    
    const { authService } = require('@/lib/auth');
    const { useAppStore } = require('@/lib/store');
    
    authService.register.mockResolvedValue({ user: mockUser, token: 'mock-token' });
    const mockStoreLogin = jest.fn();
    useAppStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: mockStoreLogin,
      logout: jest.fn(),
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.register(mockRegisterData);
    });

    expect(authService.register).toHaveBeenCalledWith(mockRegisterData);
    expect(mockStoreLogin).toHaveBeenCalledWith(mockUser);
  });

  it('should handle logout', async () => {
    const { authService } = require('@/lib/auth');
    const { useAppStore } = require('@/lib/store');
    
    const mockStoreLogout = jest.fn();
    useAppStore.mockReturnValue({
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
      isAuthenticated: true,
      login: jest.fn(),
      logout: mockStoreLogout,
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      result.current.logout();
    });

    expect(authService.logout).toHaveBeenCalled();
    expect(mockStoreLogout).toHaveBeenCalled();
  });

  it('should handle login errors', async () => {
    const mockCredentials = { email: 'test@example.com', password: 'wrong-password' };
    const mockError = new Error('Invalid credentials');
    
    const { authService } = require('@/lib/auth');
    const { useAppStore } = require('@/lib/store');
    
    authService.login.mockRejectedValue(mockError);
    useAppStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: jest.fn(),
      logout: jest.fn(),
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      try {
        await result.current.login(mockCredentials);
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });

    expect(result.current.error).toBe('Invalid credentials');
  });
});
