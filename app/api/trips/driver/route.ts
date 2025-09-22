import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-server"
import { getDriverTrips } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const trips = await getDriverTrips(session.user.id)

    // Format the response to match the expected structure
    const formattedTrips = trips.map((trip: any) => ({
      ...trip,
      vehicle: {
        plateNumber: trip.plate_number,
        model: trip.model,
      },
      checklistCompleted: trip.completed_checklist_items || 0,
      _count: {
        checklistItems: trip.total_checklist_items || 0,
      },
    }))

    return NextResponse.json(formattedTrips)
  } catch (error) {
    console.error("Error fetching driver trips:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
