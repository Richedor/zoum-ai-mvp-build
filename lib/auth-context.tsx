"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  email: string
  name: string
  role: "DRIVER" | "MANAGER"
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("zoumai-user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    if (email === "driver@zoumai.com" && password === "password") {
      const driverUser = {
        id: "1",
        email: "driver@zoumai.com",
        name: "Chauffeur Demo",
        role: "DRIVER" as const,
      }
      setUser(driverUser)
      localStorage.setItem("zoumai-user", JSON.stringify(driverUser))
      return true
    }

    if (email === "manager@zoumai.com" && password === "password") {
      const managerUser = {
        id: "2",
        email: "manager@zoumai.com",
        name: "Manager Demo",
        role: "MANAGER" as const,
      }
      setUser(managerUser)
      localStorage.setItem("zoumai-user", JSON.stringify(managerUser))
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("zoumai-user")
  }

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
