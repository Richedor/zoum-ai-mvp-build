import { type NextRequest, NextResponse } from "next/server"
import { DEMO_USERS, createToken } from "@/lib/auth-server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 })
    }

    const user = DEMO_USERS[email as keyof typeof DEMO_USERS]

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 })
    }

    const { password: _, ...userWithoutPassword } = user
    const token = createToken(userWithoutPassword)

    const response = NextResponse.json({ user: userWithoutPassword, token })

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
