import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface AuthUser {
  id: string
  email: string
  name?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
}

export interface AuthSignupData {
  email: string
  password: string
  name?: string
}

export interface AuthLoginData {
  email: string
  password: string
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Check current user on mount
  useEffect(() => {
    const getUser = async () => {
      try {
        setError(null)
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()
        
        if (authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.name,
          })
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error('Failed to get user:', err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name,
        })
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase])

  const signup = async (data: AuthSignupData) => {
    try {
      setError(null)
      setLoading(true)

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to sign up')
        throw new Error(result.error || 'Signup failed')
      }

      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const login = async (data: AuthLoginData) => {
    try {
      setError(null)
      setLoading(true)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to login')
        throw new Error(result.error || 'Login failed')
      }

      // Update user state
      if (result.user) {
        setUser({
          id: result.user.id,
          email: result.user.email || '',
          name: result.user.user_metadata?.name,
        })
      }

      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setError(null)
      setLoading(true)

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to logout')
        throw new Error(result.error || 'Logout failed')
      }

      // Clear user state
      setUser(null)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => setError(null)

  return {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    clearError,
    isAuthenticated: !!user,
  }
}
