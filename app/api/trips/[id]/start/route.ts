import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(request)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Verify the trip belongs to the current driver
    const trip = await prisma.trip.findUnique({
      where: {
        id: params.id,
        driverId: session.user.id,
      },
      include: {
        checklistItems: {
          include: {
            template: true,
          },
        },
        vehicle: true,
      },
    })

    if (!trip) {
      return NextResponse.json({ error: "Trajet non trouvé" }, { status: 404 })
    }

    if (trip.status !== "PLANNED") {
      return NextResponse.json({ error: "Le trajet ne peut pas être démarré" }, { status: 400 })
    }

    // Check if all required checklist items are completed
    const requiredItems = trip.checklistItems.filter((item) => item.template.required)
    const completedRequiredItems = requiredItems.filter((item) => item.checked)

    if (completedRequiredItems.length !== requiredItems.length) {
      return NextResponse.json(
        {
          error: "Tous les éléments requis de la checklist doivent être validés",
        },
        { status: 400 },
      )
    }

    // Start the trip
    const updatedTrip = await prisma.trip.update({
      where: {
        id: params.id,
      },
      data: {
        status: "IN_PROGRESS",
        startTime: new Date(),
      },
    })

    // Update vehicle status
    await prisma.vehicle.update({
      where: {
        id: trip.vehicle.id,
      },
      data: {
        status: "IN_USE",
      },
    })

    return NextResponse.json(updatedTrip)
  } catch (error) {
    console.error("Error starting trip:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
