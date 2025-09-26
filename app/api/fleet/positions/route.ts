export const dynamic = "force-dynamic"
export const revalidate = 0
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Get all vehicles with their latest positions
    const vehicles = await prisma.vehicle.findMany({
      where: {
        lastLat: { not: null },
        lastLng: { not: null },
      },
      select: {
        id: true,
        plateNumber: true,
        lastLat: true,
        lastLng: true,
        status: true,
        lastUpdate: true,
      },
    })

    const positions = vehicles.map((vehicle) => ({
      id: vehicle.id,
      plateNumber: vehicle.plateNumber,
      lat: vehicle.lastLat!,
      lng: vehicle.lastLng!,
      status: vehicle.status,
      lastUpdate: vehicle.lastUpdate?.toISOString() || new Date().toISOString(),
    }))

    return NextResponse.json(positions)
  } catch (error) {
    console.error("Error fetching vehicle positions:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
