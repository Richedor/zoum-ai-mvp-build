import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request)

    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 401 })
    }

    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      licenseNumber,
      licenseExpiryDate,
      photoUrl,
      emergencyContactName,
      emergencyContactPhone,
      lastMedicalVisit,
      notes,
    } = await request.json()

    if (!firstName || !lastName || !email || !password || !phone || !licenseNumber) {
      return NextResponse.json({ error: "Les champs obligatoires sont requis" }, { status: 400 })
    }

    const existingDriver = await prisma.driver.findFirst({
      where: { email },
    })

    if (existingDriver) {
      return NextResponse.json({ error: "Un chauffeur avec cet email existe déjà" }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const newDriver = await prisma.driver.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email,
        password_hash: passwordHash,
        phone,
        license_number: licenseNumber,
        license_expiry: licenseExpiryDate ? new Date(licenseExpiryDate) : null,
        photo_url: photoUrl,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        last_medical_visit: lastMedicalVisit ? new Date(lastMedicalVisit) : null,
        notes,
        status: "active",
        role: "driver",
        hire_date: new Date(),
      },
    })

    const { password_hash: _, ...driverWithoutPassword } = newDriver

    return NextResponse.json({
      message: "Chauffeur créé avec succès",
      driver: driverWithoutPassword,
    })
  } catch (error) {
    console.error("Create driver error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
