import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Simulate vehicle telemetry data
async function simulateTelemetry() {
  console.log("🚛 Starting telemetry simulation...")

  const vehicles = await prisma.vehicle.findMany({
    where: {
      status: "IN_USE",
    },
  })

  if (vehicles.length === 0) {
    console.log("No vehicles in use to simulate telemetry")
    return
  }

  for (const vehicle of vehicles) {
    // Generate random position changes (small movements)
    const latChange = (Math.random() - 0.5) * 0.01 // ~1km max change
    const lngChange = (Math.random() - 0.5) * 0.01

    const newLat = (vehicle.lastLat || 48.8566) + latChange
    const newLng = (vehicle.lastLng || 2.3522) + lngChange

    // Generate random telemetry data
    const speed = Math.random() * 90 + 10 // 10-100 km/h
    const fuel = Math.max(10, Math.random() * 100) // 10-100%

    // Update vehicle position
    await prisma.vehicle.update({
      where: { id: vehicle.id },
      data: {
        lastLat: newLat,
        lastLng: newLng,
        lastUpdate: new Date(),
      },
    })

    // Create telemetry record
    await prisma.telemetry.create({
      data: {
        vehicleId: vehicle.id,
        lat: newLat,
        lng: newLng,
        speed,
        fuel,
      },
    })

    // Generate alerts based on conditions
    if (fuel < 20) {
      await prisma.alert.upsert({
        where: {
          vehicleId_type: {
            vehicleId: vehicle.id,
            type: "FUEL_LOW",
          },
        },
        update: {
          message: `Niveau de carburant faible: ${fuel.toFixed(1)}%`,
          resolved: false,
        },
        create: {
          vehicleId: vehicle.id,
          type: "FUEL_LOW",
          message: `Niveau de carburant faible: ${fuel.toFixed(1)}%`,
          severity: fuel < 10 ? "HIGH" : "MEDIUM",
        },
      })
    }

    if (speed > 80) {
      await prisma.alert.create({
        data: {
          vehicleId: vehicle.id,
          type: "SPEED_LIMIT",
          message: `Excès de vitesse détecté: ${speed.toFixed(1)} km/h`,
          severity: speed > 90 ? "HIGH" : "MEDIUM",
        },
      })
    }

    console.log(
      `📍 Updated ${vehicle.plateNumber}: ${newLat.toFixed(4)}, ${newLng.toFixed(4)} | Speed: ${speed.toFixed(1)} km/h | Fuel: ${fuel.toFixed(1)}%`,
    )
  }

  console.log("✅ Telemetry simulation completed")
}

// Run simulation
simulateTelemetry()
  .catch((e) => {
    console.error("Error in telemetry simulation:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
