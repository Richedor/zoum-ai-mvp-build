export const dynamic = "force-dynamic"
export const revalidate = 0

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
    const priority = searchParams.get("priority")

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { vehicle: { plateNumber: { contains: search, mode: "insensitive" } } },
      ]
    }

    if (status && status !== "all") {
      where.status = status
    }

    if (priority && priority !== "all") {
      where.priority = priority
    }

    const tickets = await prisma.maintenanceTicket.findMany({
      where,
      include: {
        vehicle: {
          select: {
            plateNumber: true,
            model: true,
          },
        },
        assignedTo: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ priority: "desc" }, { scheduledAt: "asc" }, { createdAt: "desc" }],
    })

    return NextResponse.json(tickets)
  } catch (error) {
    console.error("Error fetching maintenance tickets:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request)

    if (!session?.user?.id || session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { title, description, vehicleId, priority, scheduledAt } = await request.json()

    if (!title || !description || !vehicleId) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 })
    }

    // Parse scheduled date if provided
    let scheduledDate = null
    if (scheduledAt) {
      scheduledDate = new Date(scheduledAt)
    }

    const ticket = await prisma.maintenanceTicket.create({
      data: {
        title,
        description,
        vehicleId,
        priority: priority || "MEDIUM",
        scheduledAt: scheduledDate,
        assignedToId: session.user.id,
        status: "PENDING",
      },
      include: {
        vehicle: {
          select: {
            plateNumber: true,
            model: true,
          },
        },
        assignedTo: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json(ticket)
  } catch (error) {
    console.error("Error creating maintenance ticket:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
