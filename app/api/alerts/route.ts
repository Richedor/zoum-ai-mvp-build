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

    const { searchParams } = new URL(request.url)
    const resolved = searchParams.get("resolved") === "true"
    const severity = searchParams.get("severity")
    const vehicleId = searchParams.get("vehicleId")

    const where: any = {
      resolved,
    }

    if (severity) {
      where.severity = severity
    }

    if (vehicleId) {
      where.vehicleId = vehicleId
    }

    // For drivers, only show alerts for their assigned vehicles
    if (session.user.role === "DRIVER") {
      where.vehicle = {
        trips: {
          some: {
            driverId: session.user.id,
            status: {
              in: ["PLANNED", "IN_PROGRESS"],
            },
          },
        },
      }
    }

    const alerts = await prisma.alert.findMany({
      where,
      include: {
        vehicle: {
          select: {
            plateNumber: true,
            model: true,
          },
        },
      },
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
      take: 50,
    })

    return NextResponse.json(alerts)
  } catch (error) {
    console.error("Error fetching alerts:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request)

    if (!session?.user?.id || session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { vehicleId, type, message, severity } = await request.json()

    if (!vehicleId || !type || !message) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 })
    }

    const alert = await prisma.alert.create({
      data: {
        vehicleId,
        type,
        message,
        severity: severity || "MEDIUM",
      },
      include: {
        vehicle: {
          select: {
            plateNumber: true,
            model: true,
          },
        },
      },
    })

    return NextResponse.json(alert)
  } catch (error) {
    console.error("Error creating alert:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
