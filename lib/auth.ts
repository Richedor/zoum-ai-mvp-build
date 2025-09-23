import { sql } from "./database"
import type { User } from "./database"

export async function createUser(userData: {
  id: string
  email: string
  name: string
  phone?: string
  role?: "buyer" | "seller" | "agent" | "admin"
}): Promise<User> {
  const { id, email, name, phone, role = "buyer" } = userData

  const [user] = await sql`
    INSERT INTO users (id, email, name, phone, role)
    VALUES (${id}, ${email}, ${name}, ${phone}, ${role})
    RETURNING *
  `

  return user as User
}

export async function getUserById(id: string): Promise<User | null> {
  const [user] = await sql`
    SELECT * FROM users WHERE id = ${id}
  `

  return (user as User) || null
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const [user] = await sql`
    SELECT * FROM users WHERE email = ${email}
  `

  return (user as User) || null
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  const setClause = Object.keys(updates)
    .filter((key) => key !== "id")
    .map((key) => `${key} = $${key}`)
    .join(", ")

  const [user] = await sql`
    UPDATE users 
    SET ${sql.unsafe(setClause)}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `

  return user as User
}

export async function updateLastLogin(id: string): Promise<void> {
  await sql`
    UPDATE users 
    SET last_login = NOW()
    WHERE id = ${id}
  `
}
