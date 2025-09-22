import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback-secret-for-v0-demo-that-is-long-enough"

export interface User {
  id: string
  email: string
  name: string
  role: "DRIVER" | "MANAGER"
}

export function createToken(user: User): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): User | null {
  try {
    return jwt.verify(token, JWT_SECRET) as User
  } catch {
    return null
  }
}

export async function getServerSession(request: NextRequest): Promise<{ user: User } | null> {
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "") || request.cookies.get("auth-token")?.value

  if (!token) {
    return null
  }

  const user = verifyToken(token)
  return user ? { user } : null
}

// Mock users for demo
export const DEMO_USERS = {
  "driver@zoumai.com": {
    id: "1",
    email: "driver@zoumai.com",
    name: "Chauffeur Demo",
    role: "DRIVER" as const,
    password: "password",
  },
  "manager@zoumai.com": {
    id: "2",
    email: "manager@zoumai.com",
    name: "Manager Demo",
    role: "MANAGER" as const,
    password: "password",
  },
}
