export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(request)

    if (!session?.user?.id || session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { status, cost } = await request.json()

    const updateData: any = {}

    if (status) {
      updateData.status = status
      if (status === "COMPLETED") {
        updateData.completedAt = new Date()
      }
    }

    if (cost !== undefined) {
      updateData.cost = cost
    }

    const ticket = await prisma.maintenanceTicket.update({
      where: {
        id: params.id,
      },
      data: updateData,
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
    console.error("Error updating maintenance ticket:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
