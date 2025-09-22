import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function generateAlerts() {
  console.log("🚨 Generating sample alerts...")

  const vehicles = await prisma.vehicle.findMany()

  const alertTypes = [
    {
      type: "MAINTENANCE",
      messages: ["Révision programmée dans 3 jours", "Contrôle technique à effectuer", "Changement d'huile recommandé"],
      severity: "LOW",
    },
    {
      type: "ENGINE_WARNING",
      messages: ["Voyant moteur allumé", "Température moteur élevée", "Pression d'huile faible"],
      severity: "HIGH",
    },
    {
      type: "TIRE_PRESSURE",
      messages: [
        "Pression des pneus avant faible",
        "Pression des pneus arrière faible",
        "Contrôle des pneus recommandé",
      ],
      severity: "MEDIUM",
    },
  ]

  for (const vehicle of vehicles) {
    // Generate 0-2 alerts per vehicle
    const alertCount = Math.floor(Math.random() * 3)

    for (let i = 0; i < alertCount; i++) {
      const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)]
      const message = alertType.messages[Math.floor(Math.random() * alertType.messages.length)]

      await prisma.alert.create({
        data: {
          vehicleId: vehicle.id,
          type: alertType.type as any,
          message,
          severity: alertType.severity as any,
        },
      })
    }
  }

  console.log("✅ Sample alerts generated")
}

generateAlerts()
  .catch((e) => {
    console.error("Error generating alerts:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
