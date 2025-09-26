import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"
export const revalidate = 0

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
        { startPoint: { contains: search, mode: "insensitive" } },
        { endPoint: { contains: search, mode: "insensitive" } },
        { driver: { name: { contains: search, mode: "insensitive" } } },
        { vehicle: { plateNumber: { contains: search, mode: "insensitive" } } },
      ]
    }

    if (status && status !== "all") {
      where.status = status
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        driver: {
          select: {
            name: true,
            email: true,
          },
        },
        vehicle: {
          select: {
            plateNumber: true,
            model: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(trips)
  } catch (error) {
    console.error("Error fetching trips:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request)

    if (!session?.user?.id || session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { startPoint, endPoint, driverId, vehicleId, scheduledDate, scheduledTime, notes } = await request.json()

    if (!startPoint || !endPoint || !driverId || !vehicleId) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 })
    }

    // Check if vehicle is available
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    })

    if (!vehicle || vehicle.status !== "AVAILABLE") {
      return NextResponse.json({ error: "Véhicule non disponible" }, { status: 400 })
    }

    // Create scheduled datetime if provided
    let startTime = null
    if (scheduledDate && scheduledTime) {
      startTime = new Date(`${scheduledDate}T${scheduledTime}`)
    }

    // Create trip
    const trip = await prisma.trip.create({
      data: {
        startPoint,
        endPoint,
        driverId,
        vehicleId,
        startTime,
        status: "PLANNED",
      },
      include: {
        driver: {
          select: {
            name: true,
            email: true,
          },
        },
        vehicle: {
          select: {
            plateNumber: true,
            model: true,
          },
        },
      },
    })

    // Create checklist items for the trip
    const checklistTemplates = await prisma.checklistItemTemplate.findMany({
      orderBy: { order: "asc" },
    })

    await Promise.all(
      checklistTemplates.map((template) =>
        prisma.tripChecklistItem.create({
          data: {
            tripId: trip.id,
            templateId: template.id,
          },
        }),
      ),
    )

    return NextResponse.json(trip)
  } catch (error) {
    console.error("Error creating trip:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
