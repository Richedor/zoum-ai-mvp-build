"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Clock, Fuel, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import dynamic from "next/dynamic"

// Dynamic import for MapBox component to avoid SSR issues
const MapBox = dynamic(() => import("@/components/mapbox"), { ssr: false })

interface Trip {
  id: string
  startPoint: string
  endPoint: string
  status: string
  startTime: string | null
  vehicle: {
    id: string
    plateNumber: string
    model: string
    lastLat: number | null
    lastLng: number | null
  }
}

interface Alert {
  id: string
  type: string
  message: string
  severity: string
  createdAt: string
}

export default function LiveTripPage() {
  const params = useParams()

  const { data: trip, isLoading } = useQuery({
    queryKey: ["trip", params.id],
    queryFn: async () => {
      const response = await fetch(`/api/trips/${params.id}`)
      if (!response.ok) throw new Error("Failed to fetch trip")
      return response.json()
    },
  })

  const { data: alerts } = useQuery({
    queryKey: ["trip-alerts", params.id],
    queryFn: async () => {
      const response = await fetch(`/api/trips/${params.id}/alerts`)
      if (!response.ok) throw new Error("Failed to fetch alerts")
      return response.json()
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Trajet non trouvé</p>
      </div>
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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/driver/trips/${params.id}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Trajet en cours</h1>
              <p className="text-muted-foreground">
                {trip.startPoint} → {trip.endPoint}
              </p>
            </div>
            <Badge variant="default">En cours</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Informations du trajet */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Véhicule</p>
                  <p className="text-sm text-muted-foreground">{trip.vehicle.plateNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Départ</p>
                  <p className="text-sm text-muted-foreground">
                    {trip.startTime ? format(new Date(trip.startTime), "HH:mm", { locale: fr }) : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Fuel className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Carburant</p>
                  <p className="text-sm text-muted-foreground">85%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Carte */}
        <Card>
          <CardHeader>
            <CardTitle>Position en temps réel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 rounded-lg overflow-hidden">
              <MapBox
                vehicles={
                  trip.vehicle.lastLat && trip.vehicle.lastLng
                    ? [
                        {
                          id: trip.vehicle.id,
                          plateNumber: trip.vehicle.plateNumber,
                          lat: trip.vehicle.lastLat,
                          lng: trip.vehicle.lastLng,
                          status: "IN_USE",
                        },
                      ]
                    : []
                }
                center={
                  trip.vehicle.lastLat && trip.vehicle.lastLng
                    ? {
                        lat: trip.vehicle.lastLat,
                        lng: trip.vehicle.lastLng,
                      }
                    : undefined
                }
                zoom={12}
              />
            </div>
          </CardContent>
        </Card>

        {/* Alertes */}
        {alerts && alerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertes actives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert: Alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(alert.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}
                      </p>
                    </div>
                    {getSeverityBadge(alert.severity)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
