import { renderHook, act } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'

// Mock the API
jest.mock('@/lib/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  defaults: {
    headers: {
      common: {}
    }
  },
  interceptors: {
    request: {
      use: jest.fn()
    },
    response: {
      use: jest.fn()
    }
  }
}))

const mockApi = api as jest.Mocked<typeof api>

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('should initialize with no user when not authenticated', () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.loading).toBe(false)
  })

  it('should load user from localStorage on mount', () => {
    const mockUser = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
    }
    const mockToken = 'mock-jwt-token'

    localStorage.setItem('user', JSON.stringify(mockUser))
    localStorage.setItem('token', mockToken)

    const { result } = renderHook(() => useAuth())

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('should login successfully', async () => {
    const mockLoginData = {
      email: 'test@example.com',
      password: 'password123'
    }

    const mockResponse = {
      data: {
        success: true,
        data: {
          user: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
          },
          token: 'mock-jwt-token'
        }
      }
    }

    mockApi.post.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login(mockLoginData.email, mockLoginData.password)
    })

    expect(mockApi.post).toHaveBeenCalledWith('/auth/login', mockLoginData)
    expect(result.current.user).toEqual(mockResponse.data.data.user)
    expect(result.current.isAuthenticated).toBe(true)
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockResponse.data.data.user))
    expect(localStorage.getItem('token')).toBe(mockResponse.data.data.token)
  })

  it('should handle login error', async () => {
    const mockLoginData = {
      email: 'test@example.com',
      password: 'wrong-password'
    }

    const mockError = {
      response: {
        data: {
          error: 'Invalid credentials'
        }
      }
    }

    mockApi.post.mockRejectedValue(mockError)

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login(mockLoginData.email, mockLoginData.password)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should register successfully', async () => {
    const mockRegisterData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    }

    const mockResponse = {
      data: {
        success: true,
        data: {
          user: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
          },
          token: 'mock-jwt-token'
        }
      }
    }

    mockApi.post.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.register(mockRegisterData.name, mockRegisterData.email, mockRegisterData.password)
    })

    expect(mockApi.post).toHaveBeenCalledWith('/auth/register', mockRegisterData)
    expect(result.current.user).toEqual(mockResponse.data.data.user)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('should logout successfully', () => {
    const mockUser = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
    }

    localStorage.setItem('user', JSON.stringify(mockUser))
    localStorage.setItem('token', 'mock-jwt-token')

    const { result } = renderHook(() => useAuth())

    act(() => {
      result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(localStorage.getItem('user')).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('should handle API errors gracefully', async () => {
    const mockLoginData = {
      email: 'test@example.com',
      password: 'password123'
    }

    mockApi.post.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login(mockLoginData.email, mockLoginData.password)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })
})
