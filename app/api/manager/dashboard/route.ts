import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)

    if (!session?.user?.id || session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Get dashboard statistics
    const [
      totalVehicles,
      activeTrips,
      totalDrivers,
      activeAlerts,
      vehiclesByStatus,
      tripsByStatus,
      recentTrips,
      maintenanceTickets,
    ] = await Promise.all([
      // Total vehicles
      prisma.vehicle.count(),

      // Active trips
      prisma.trip.count({
        where: {
          status: "IN_PROGRESS",
        },
      }),

      // Total drivers
      prisma.user.count({
        where: {
          role: "DRIVER",
        },
      }),

      // Active alerts
      prisma.alert.count({
        where: {
          resolved: false,
        },
      }),

      // Vehicles by status
      prisma.vehicle.groupBy({
        by: ["status"],
        _count: {
          status: true,
        },
      }),

      // Trips by status
      prisma.trip.groupBy({
        by: ["status"],
        _count: {
          status: true,
        },
      }),

      // Recent trips
      prisma.trip.findMany({
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          driver: {
            select: {
              name: true,
            },
          },
          vehicle: {
            select: {
              plateNumber: true,
            },
          },
        },
      }),

      // Maintenance tickets
      prisma.maintenanceTicket.findMany({
        take: 10,
        orderBy: {
          scheduledAt: "asc",
        },
        include: {
          vehicle: {
            select: {
              plateNumber: true,
            },
          },
        },
      }),
    ])

    // Format data for charts
    const vehicleStatusData = vehiclesByStatus.map((item) => ({
      status: item.status,
      count: item._count.status,
    }))

    const tripStatusData = tripsByStatus.map((item) => ({
      status: item.status,
      count: item._count.status,
    }))

    return NextResponse.json({
      totalVehicles,
      activeTrips,
      totalDrivers,
      activeAlerts,
      vehiclesByStatus: vehicleStatusData,
      tripsByStatus: tripStatusData,
      recentTrips,
      maintenanceTickets,
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
