"use client"

import { useAuth } from "@/lib/auth-context"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Truck, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { DashboardLayout } from "@/components/dashboard-layout"

interface Trip {
  id: string
  startPoint: string
  endPoint: string
  status: string
  startTime: string | null
  endTime: string | null
  vehicle: {
    plateNumber: string
    model: string
  }
  _count: {
    checklistItems: number
  }
  checklistCompleted: number
}

interface Alert {
  id: string
  type: string
  message: string
  severity: string
  createdAt: string
  vehicle: {
    plateNumber: string
  }
}

export default function DriverDashboard() {
  const { user } = useAuth()

  const { data: trips, isLoading: tripsLoading } = useQuery({
    queryKey: ["driver-trips"],
    queryFn: async () => {
      const response = await fetch("/api/trips/driver")
      if (!response.ok) throw new Error("Failed to fetch trips")
      return response.json()
    },
  })

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ["driver-alerts"],
    queryFn: async () => {
      const response = await fetch("/api/alerts/driver")
      if (!response.ok) throw new Error("Failed to fetch alerts")
      return response.json()
    },
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      PLANNED: "secondary",
      IN_PROGRESS: "default",
      COMPLETED: "outline",
      CANCELLED: "destructive",
    } as const

    const labels = {
      PLANNED: "Planifié",
      IN_PROGRESS: "En cours",
      COMPLETED: "Terminé",
      CANCELLED: "Annulé",
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  const getSeverityBadge = (severity: string) => {
    const variants = {
      LOW: "outline",
      MEDIUM: "secondary",
      HIGH: "default",
      CRITICAL: "destructive",
    } as const

    return <Badge variant={variants[severity as keyof typeof variants] || "outline"}>{severity}</Badge>
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Alertes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertes actives
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <p>Chargement des alertes...</p>
              ) : alerts?.length > 0 ? (
                <div className="space-y-3">
                  {alerts.map((alert: Alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-sm text-muted-foreground">
                          Véhicule {alert.vehicle.plateNumber} •{" "}
                          {format(new Date(alert.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}
                        </p>
                      </div>
                      {getSeverityBadge(alert.severity)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Aucune alerte active</p>
              )}
            </CardContent>
          </Card>

          {/* Trajets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Mes trajets
              </CardTitle>
              <CardDescription>Gérez vos trajets assignés</CardDescription>
            </CardHeader>
            <CardContent>
              {tripsLoading ? (
                <p>Chargement des trajets...</p>
              ) : trips?.length > 0 ? (
                <div className="space-y-4">
                  {trips.map((trip: Trip) => (
                    <div key={trip.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">
                              {trip.startPoint} → {trip.endPoint}
                            </h3>
                            {getStatusBadge(trip.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Truck className="h-4 w-4" />
                              {trip.vehicle.plateNumber} ({trip.vehicle.model})
                            </span>
                            {trip.startTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {format(new Date(trip.startTime), "dd/MM/yyyy HH:mm", { locale: fr })}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 text-sm">
                            Checklist: {trip.checklistCompleted}/{trip._count.checklistItems} éléments validés
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/driver/trips/${trip.id}`}>Voir détails</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Aucun trajet assigné</p>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </DashboardLayout>
  )
}
