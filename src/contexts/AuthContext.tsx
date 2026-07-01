'use client'

// Auth session context: exposes the current admin user, sign-in/out, and role
// checks. Server-state (the user profile) is fetched via TanStack Query keyed on
// the presence of an access token cookie.

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'

import { useRouter } from 'next/navigation'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { authApi } from '@/features/auth/api/authApi'
import { isAdminRole, type User, type UserRole } from '@/features/auth/types'
import type { SignInValues } from '@/features/auth/schema'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '@/libs/auth/tokens'
import { ApiError } from '@/libs/api/types'

type AuthContextValue = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (values: SignInValues) => Promise<User>
  signOut: () => Promise<void>
  hasRole: (...roles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    data: user,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    enabled: typeof window !== 'undefined' && !!getAccessToken(),
    retry: false,
    staleTime: 5 * 60_000
  })

  const signIn = useCallback(
    async (values: SignInValues) => {
      const result = await authApi.signIn(values)

      if (!isAdminRole(result.user.role)) {
        throw new ApiError({
          status: 403,
          message: 'This account does not have admin access.',
          code: 'FORBIDDEN'
        })
      }

      setTokens(result.accessToken, result.refreshToken)
      queryClient.setQueryData(['auth', 'me'], result.user)
      await refetch()

      return result.user
    },
    [queryClient, refetch]
  )

  const signOutMutation = useMutation({
    mutationFn: async () => {
      const refreshToken = getRefreshToken()

      if (refreshToken) await authApi.signOut(refreshToken).catch(() => undefined)
    }
  })

  const signOut = useCallback(async () => {
    await signOutMutation.mutateAsync()
    clearTokens()
    queryClient.clear()
    router.replace('/login')
  }, [queryClient, router, signOutMutation])

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!user) return false
      if (user.role === 'admin') return true // admin is a superset (doc §6)

      return roles.includes(user.role)
    },
    [user]
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user: user ?? null,
      isLoading,
      isAuthenticated: !!user,
      signIn,
      signOut,
      hasRole
    }),
    [user, isLoading, signIn, signOut, hasRole]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)

  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')

  return ctx
}
