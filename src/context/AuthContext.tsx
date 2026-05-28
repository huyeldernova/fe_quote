'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { UserResponse } from '@/types'

interface AuthContextValue {
  user: UserResponse | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: UserResponse | null) => void
  login: (accessToken: string, refreshToken: string, user: UserResponse) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user')
      const token = localStorage.getItem('accessToken')
      if (stored && token) {
        setUserState(JSON.parse(stored) as UserResponse)
      }
    } catch {
      // ignore parse errors
    } finally {
      setIsLoading(false)
    }
  }, [])

  function login(accessToken: string, refreshToken: string, user: UserResponse) {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(user))
    setUserState(user)
  }

  function logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUserState(null)
  }

  function setUser(user: UserResponse | null) {
    setUserState(user)
    if (user) localStorage.setItem('user', JSON.stringify(user))
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, setUser, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
