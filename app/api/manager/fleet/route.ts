import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)

    if (!session?.user?.id || session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const status = searchParams.get("status")

    const where: any = {}

    if (search) {
      where.OR = [
        { plateNumber: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
      ]
    }

    if (status && status !== "all") {
      where.status = status
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: {
        _count: {
          select: {
            trips: true,
            alerts: {
              where: {
                resolved: false,
              },
            },
          },
        },
        trips: {
          where: {
            status: "IN_PROGRESS",
          },
          take: 1,
          include: {
            driver: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        plateNumber: "asc",
      },
    })

    // Format the response to include current trip info
    const formattedVehicles = vehicles.map((vehicle) => ({
      ...vehicle,
      currentTrip: vehicle.trips[0] || null,
      trips: undefined, // Remove the trips array from response
    }))

    return NextResponse.json(formattedVehicles)
  } catch (error) {
    console.error("Error fetching fleet vehicles:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
