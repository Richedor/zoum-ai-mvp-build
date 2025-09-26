export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-server"
import { getActiveAlerts } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const alerts = await getActiveAlerts(undefined, session.user.id)

    // Format the response to match the expected structure
    const formattedAlerts = alerts.map((alert: any) => ({
      ...alert,
      vehicle: {
        plateNumber: alert.plate_number,
      },
    }))

    return NextResponse.json(formattedAlerts.slice(0, 10))
  } catch (error) {
    console.error("Error fetching driver alerts:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
