export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-server"
import { getTripById } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(request)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const trip = await getTripById(params.id, session.user.id)

    if (!trip) {
      return NextResponse.json({ error: "Trajet non trouvé" }, { status: 404 })
    }

    return NextResponse.json(trip)
  } catch (error) {
    console.error("Error fetching trip:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
