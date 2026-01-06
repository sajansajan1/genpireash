"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import type { User } from "@supabase/supabase-js"

// Mock user data
const mockUser = {
  id: "mock-user-id",
  email: "dev@example.com",
  user_metadata: {
    full_name: "Development User",
  },
} as User

type AuthContextType = {
  user: User | null
  isLoading: boolean
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: mockUser, // Always provide a mock user
  isLoading: false,
  refreshAuth: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Always set a mock user and isLoading to false
  const [user] = useState<User | null>(mockUser)
  const [isLoading] = useState(false)

  // No-op refresh function
  const refreshAuth = async () => {
    console.log("Auth refresh bypassed")
  }

  return <AuthContext.Provider value={{ user, isLoading, refreshAuth }}>{children}</AuthContext.Provider>
}

// Loading component for protected routes - now just passes through immediately
export function ProtectedRouteLoader({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export const useAuth = () => useContext(AuthContext)
