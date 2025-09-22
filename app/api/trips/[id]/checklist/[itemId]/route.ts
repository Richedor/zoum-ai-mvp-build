import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: NextRequest, { params }: { params: { id: string; itemId: string } }) {
  try {
    const session = await getServerSession(request)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { checked, notes } = await request.json()

    // Verify the trip belongs to the current driver
    const trip = await prisma.trip.findUnique({
      where: {
        id: params.id,
        driverId: session.user.id,
      },
    })

    if (!trip) {
      return NextResponse.json({ error: "Trajet non trouvé" }, { status: 404 })
    }

    const updatedItem = await prisma.tripChecklistItem.update({
      where: {
        id: params.itemId,
      },
      data: {
        checked,
        notes: notes || null,
        updatedAt: new Date(),
      },
      include: {
        template: true,
      },
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error("Error updating checklist item:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
