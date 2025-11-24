import { renderHook, act } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'

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

// Mock the store - Zustand stores are hooks that return state
const mockStoreLogin = jest.fn();
const mockStoreLogout = jest.fn();

jest.mock('@/lib/store', () => ({
  useAppStore: jest.fn(() => ({
    user: null,
    isAuthenticated: false,
    login: mockStoreLogin,
    logout: mockStoreLogout,
  })),
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

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    mockStoreLogin.mockClear()
    mockStoreLogout.mockClear()
  })

  it('should initialize with no user when not authenticated', async () => {
    const { authService } = require('@/lib/auth');
    authService.isAuthenticated.mockReturnValue(false);
    
    const { result } = renderHook(() => useAuth())

    // Wait for initial auth check to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.loading).toBe(false)
  })

  it('should load user from store when authenticated', async () => {
    const mockUser = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
    }

    const { useAppStore } = require('@/lib/store');
    const { authService } = require('@/lib/auth');
    authService.isAuthenticated.mockReturnValue(true);
    authService.getProfile.mockResolvedValue(mockUser);
    useAppStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: mockStoreLogin,
      logout: mockStoreLogout,
    });

    const { result } = renderHook(() => useAuth())

    // Wait for initial auth check to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockStoreLogin).toHaveBeenCalledWith(mockUser)
  })

  it('should login successfully', async () => {
    const mockLoginData = {
      email: 'test@example.com',
      password: 'password123'
    }

    const mockUser = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
    }

    const { authService } = require('@/lib/auth');
    const { useAppStore } = require('@/lib/store');
    authService.login.mockResolvedValue({ user: mockUser, token: 'mock-jwt-token' });
    authService.isAuthenticated.mockReturnValue(false);
    useAppStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: mockStoreLogin,
      logout: mockStoreLogout,
    });

    const { result } = renderHook(() => useAuth())

    // Wait for initial auth check to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.login(mockLoginData)
    })

    expect(authService.login).toHaveBeenCalledWith(mockLoginData)
    expect(mockStoreLogin).toHaveBeenCalledWith(mockUser)
  })

  it('should handle login error', async () => {
    const mockLoginData = {
      email: 'test@example.com',
      password: 'wrong-password'
    }

    const mockError = new Error('Invalid credentials')

    const { authService } = require('@/lib/auth');
    const { useAppStore } = require('@/lib/store');
    authService.login.mockRejectedValue(mockError);
    authService.isAuthenticated.mockReturnValue(false);
    useAppStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: mockStoreLogin,
      logout: mockStoreLogout,
    });

    const { result } = renderHook(() => useAuth())

    // Wait for initial auth check to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      try {
        await result.current.login(mockLoginData)
      } catch (error) {
        // Expected
      }
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.error).toBe('Invalid credentials')
  })

  it('should register successfully', async () => {
    const mockRegisterData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    }

    const mockUser = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
    }

    const { authService } = require('@/lib/auth');
    const { useAppStore } = require('@/lib/store');
    authService.register.mockResolvedValue({ user: mockUser, token: 'mock-jwt-token' });
    authService.isAuthenticated.mockReturnValue(false);
    useAppStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: mockStoreLogin,
      logout: mockStoreLogout,
    });

    const { result } = renderHook(() => useAuth())

    // Wait for initial auth check to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.register(mockRegisterData)
    })

    expect(authService.register).toHaveBeenCalledWith(mockRegisterData)
    expect(mockStoreLogin).toHaveBeenCalledWith(mockUser)
  })

  it('should logout successfully', async () => {
    const mockUser = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
    }

    const { authService } = require('@/lib/auth');
    const { useAppStore } = require('@/lib/store');
    authService.isAuthenticated.mockReturnValue(true);
    useAppStore.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      login: mockStoreLogin,
      logout: mockStoreLogout,
    });

    const { result } = renderHook(() => useAuth())

    // Wait for initial auth check to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    act(() => {
      result.current.logout()
    })

    expect(authService.logout).toHaveBeenCalled()
    expect(mockStoreLogout).toHaveBeenCalled()
  })

  it('should handle API errors gracefully', async () => {
    const mockLoginData = {
      email: 'test@example.com',
      password: 'password123'
    }

    const { authService } = require('@/lib/auth');
    const { useAppStore } = require('@/lib/store');
    authService.login.mockRejectedValue(new Error('Network error'));
    authService.isAuthenticated.mockReturnValue(false);
    useAppStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: mockStoreLogin,
      logout: mockStoreLogout,
    });

    const { result } = renderHook(() => useAuth())

    // Wait for initial auth check to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      try {
        await result.current.login(mockLoginData)
      } catch (error) {
        // Expected
      }
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })
})
