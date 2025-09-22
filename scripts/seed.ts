import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Create users
  const hashedPassword = await bcrypt.hash("password123", 12)

  const manager = await prisma.user.upsert({
    where: { email: "manager@zoumai.com" },
    update: {},
    create: {
      email: "manager@zoumai.com",
      name: "Jean Dupont",
      password: hashedPassword,
      role: "MANAGER",
    },
  })

  const driver1 = await prisma.user.upsert({
    where: { email: "driver1@zoumai.com" },
    update: {},
    create: {
      email: "driver1@zoumai.com",
      name: "Pierre Martin",
      password: hashedPassword,
      role: "DRIVER",
    },
  })

  const driver2 = await prisma.user.upsert({
    where: { email: "driver2@zoumai.com" },
    update: {},
    create: {
      email: "driver2@zoumai.com",
      name: "Marie Dubois",
      password: hashedPassword,
      role: "DRIVER",
    },
  })

  // Create vehicles
  const vehicle1 = await prisma.vehicle.upsert({
    where: { plateNumber: "AB-123-CD" },
    update: {},
    create: {
      plateNumber: "AB-123-CD",
      model: "Renault Master",
      year: 2022,
      status: "AVAILABLE",
      lastLat: 48.8566,
      lastLng: 2.3522,
      lastUpdate: new Date(),
    },
  })

  const vehicle2 = await prisma.vehicle.upsert({
    where: { plateNumber: "EF-456-GH" },
    update: {},
    create: {
      plateNumber: "EF-456-GH",
      model: "Mercedes Sprinter",
      year: 2023,
      status: "IN_USE",
      lastLat: 48.8606,
      lastLng: 2.3376,
      lastUpdate: new Date(),
    },
  })

  const vehicle3 = await prisma.vehicle.upsert({
    where: { plateNumber: "IJ-789-KL" },
    update: {},
    create: {
      plateNumber: "IJ-789-KL",
      model: "Ford Transit",
      year: 2021,
      status: "MAINTENANCE",
      lastLat: 48.8738,
      lastLng: 2.295,
      lastUpdate: new Date(),
    },
  })

  // Create checklist templates
  const templates = [
    { name: "Vérification des pneus", description: "Contrôler la pression et l'état des pneus", order: 1 },
    { name: "Niveau de carburant", description: "Vérifier le niveau de carburant", order: 2 },
    { name: "Éclairage", description: "Tester tous les feux (phares, clignotants, feux de stop)", order: 3 },
    { name: "Documents", description: "Vérifier la présence des papiers du véhicule", order: 4 },
  ]

  for (const template of templates) {
    await prisma.checklistItemTemplate.upsert({
      where: { id: `template-${template.order}` },
      update: {},
      create: {
        id: `template-${template.order}`,
        ...template,
      },
    })
  }

  // Create trips
  const trip1 = await prisma.trip.create({
    data: {
      startPoint: "Paris, France",
      endPoint: "Lyon, France",
      status: "PLANNED",
      driverId: driver1.id,
      vehicleId: vehicle1.id,
    },
  })

  const trip2 = await prisma.trip.create({
    data: {
      startPoint: "Marseille, France",
      endPoint: "Nice, France",
      status: "IN_PROGRESS",
      startTime: new Date(),
      driverId: driver2.id,
      vehicleId: vehicle2.id,
    },
  })

  // Create checklist items for trips
  const checklistTemplates = await prisma.checklistItemTemplate.findMany()

  for (const template of checklistTemplates) {
    await prisma.tripChecklistItem.create({
      data: {
        tripId: trip1.id,
        templateId: template.id,
        checked: false,
      },
    })

    await prisma.tripChecklistItem.create({
      data: {
        tripId: trip2.id,
        templateId: template.id,
        checked: true,
      },
    })
  }

  // Create alerts
  await prisma.alert.create({
    data: {
      type: "FUEL_LOW",
      message: "Niveau de carburant faible",
      severity: "MEDIUM",
      vehicleId: vehicle2.id,
    },
  })

  await prisma.alert.create({
    data: {
      type: "MAINTENANCE",
      message: "Révision programmée dans 2 jours",
      severity: "LOW",
      vehicleId: vehicle1.id,
    },
  })

  // Create maintenance tickets
  await prisma.maintenanceTicket.create({
    data: {
      title: "Révision 10 000 km",
      description: "Révision complète du véhicule",
      status: "PENDING",
      priority: "MEDIUM",
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // In 2 days
      vehicleId: vehicle1.id,
      assignedToId: manager.id,
    },
  })

  await prisma.maintenanceTicket.create({
    data: {
      title: "Réparation freins",
      description: "Remplacement des plaquettes de frein avant",
      status: "IN_PROGRESS",
      priority: "HIGH",
      cost: 250.0,
      vehicleId: vehicle3.id,
      assignedToId: manager.id,
    },
  })

  console.log("✅ Database seeded successfully!")
  console.log("👤 Manager: manager@zoumai.com / password123")
  console.log("🚗 Driver 1: driver1@zoumai.com / password123")
  console.log("🚗 Driver 2: driver2@zoumai.com / password123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
