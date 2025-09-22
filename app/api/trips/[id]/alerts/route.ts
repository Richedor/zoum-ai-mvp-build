import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(request)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Get the trip to verify ownership and get vehicle ID
    const trip = await prisma.trip.findUnique({
      where: {
        id: params.id,
        driverId: session.user.id,
      },
      select: {
        vehicleId: true,
      },
    })

    if (!trip) {
      return NextResponse.json({ error: "Trajet non trouvé" }, { status: 404 })
    }

    // Get active alerts for the vehicle
    const alerts = await prisma.alert.findMany({
      where: {
        vehicleId: trip.vehicleId,
        resolved: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(alerts)
  } catch (error) {
    console.error("Error fetching trip alerts:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
