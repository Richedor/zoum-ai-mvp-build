import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(request)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const alert = await prisma.alert.update({
      where: {
        id: params.id,
      },
      data: {
        resolved: true,
        resolvedAt: new Date(),
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
    console.error("Error resolving alert:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
