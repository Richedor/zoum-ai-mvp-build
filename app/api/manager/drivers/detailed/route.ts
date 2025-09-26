export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)

    if (!session?.user?.id || session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const drivers = await prisma.user.findMany({
      where: {
        role: "DRIVER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        trips: {
          select: {
            id: true,
            status: true,
            distance: true,
            startTime: true,
            endTime: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    // Calculate statistics for each driver
    const driversWithStats = drivers.map((driver) => {
      const completedTrips = driver.trips.filter((trip) => trip.status === "COMPLETED")
      const totalTrips = driver.trips.length
      const totalDistance = completedTrips.reduce((sum, trip) => sum + (trip.distance || 0), 0)

      // Calculate average rating (mock data for now)
      const averageRating = Math.random() * 2 + 3 // Random rating between 3-5

      // Calculate this month's trips
      const thisMonth = new Date()
      thisMonth.setDate(1)
      const thisMonthTrips = driver.trips.filter((trip) => new Date(trip.createdAt) >= thisMonth).length

      return {
        id: driver.id,
        name: driver.name,
        email: driver.email,
        joinedAt: driver.createdAt,
        totalTrips,
        completedTrips: completedTrips.length,
        totalDistance: Math.round(totalDistance),
        averageRating: Math.round(averageRating * 10) / 10,
        thisMonthTrips,
        lastTripDate: driver.trips[0]?.createdAt || null,
        status: driver.trips.some((trip) => trip.status === "IN_PROGRESS") ? "EN_COURSE" : "DISPONIBLE",
      }
    })

    return NextResponse.json(driversWithStats)
  } catch (error) {
    console.error("Error fetching detailed drivers:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
