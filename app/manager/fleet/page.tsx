"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Search, Filter, MapPin, Truck, Clock, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import dynamic from "next/dynamic"

// Dynamic import for MapBox component to avoid SSR issues
const MapBox = dynamic(() => import("@/components/mapbox"), { ssr: false })

interface Vehicle {
  id: string
  plateNumber: string
  model: string
  year: number
  status: string
  lastLat: number | null
  lastLng: number | null
  lastUpdate: string | null
  _count: {
    trips: number
    alerts: number
  }
  currentTrip?: {
    id: string
    startPoint: string
    endPoint: string
    driver: {
      name: string
    }
  }
}

export default function FleetPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["fleet-vehicles", search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (statusFilter !== "all") params.append("status", statusFilter)

      const response = await fetch(`/api/manager/fleet?${params}`)
      if (!response.ok) throw new Error("Failed to fetch vehicles")
      return response.json()
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      AVAILABLE: "outline",
      IN_USE: "default",
      MAINTENANCE: "secondary",
      OUT_OF_SERVICE: "destructive",
    } as const

    const labels = {
      AVAILABLE: "Disponible",
      IN_USE: "En service",
      MAINTENANCE: "Maintenance",
      OUT_OF_SERVICE: "Hors service",
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  const getStatusColor = (status: string) => {
    const colors = {
      AVAILABLE: "#34d399",
      IN_USE: "#3b82f6",
      MAINTENANCE: "#f59e0b",
      OUT_OF_SERVICE: "#ef4444",
    }
    return colors[status as keyof typeof colors] || "#6b7280"
  }

  // Prepare vehicles for map display
  const mapVehicles =
    vehicles
      ?.filter((vehicle: Vehicle) => vehicle.lastLat && vehicle.lastLng)
      .map((vehicle: Vehicle) => ({
        id: vehicle.id,
        plateNumber: vehicle.plateNumber,
        lat: vehicle.lastLat!,
        lng: vehicle.lastLng!,
        status: vehicle.status,
      })) || []

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/manager">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Gestion de la flotte</h1>
              <p className="text-muted-foreground">Suivez la position et l'état de vos véhicules</p>
            </div>
            <div className="text-sm text-muted-foreground">
              {vehicles?.length || 0} véhicule{(vehicles?.length || 0) > 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="map" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="map">Vue carte</TabsTrigger>
            <TabsTrigger value="list">Vue liste</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher par plaque, modèle..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="AVAILABLE">Disponible</SelectItem>
                      <SelectItem value="IN_USE">En service</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      <SelectItem value="OUT_OF_SERVICE">Hors service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Position des véhicules en temps réel
                </CardTitle>
                <CardDescription>
                  {mapVehicles.length} véhicule{mapVehicles.length > 1 ? "s" : ""} géolocalisé
                  {mapVehicles.length > 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 rounded-lg overflow-hidden">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center bg-muted">
                      <p>Chargement de la carte...</p>
                    </div>
                  ) : (
                    <MapBox vehicles={mapVehicles} zoom={8} />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Status Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["AVAILABLE", "IN_USE", "MAINTENANCE", "OUT_OF_SERVICE"].map((status) => {
                const count = vehicles?.filter((v: Vehicle) => v.status === status).length || 0
                const labels = {
                  AVAILABLE: "Disponibles",
                  IN_USE: "En service",
                  MAINTENANCE: "Maintenance",
                  OUT_OF_SERVICE: "Hors service",
                }
                return (
                  <Card key={status}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getStatusColor(status) }} />
                        <div>
                          <p className="text-2xl font-bold">{count}</p>
                          <p className="text-sm text-muted-foreground">{labels[status as keyof typeof labels]}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher par plaque, modèle..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="AVAILABLE">Disponible</SelectItem>
                      <SelectItem value="IN_USE">En service</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      <SelectItem value="OUT_OF_SERVICE">Hors service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Vehicles List */}
            <Card>
              <CardHeader>
                <CardTitle>Liste des véhicules</CardTitle>
                <CardDescription>
                  {vehicles?.length || 0} véhicule{(vehicles?.length || 0) > 1 ? "s" : ""} dans la flotte
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p>Chargement des véhicules...</p>
                ) : vehicles?.length > 0 ? (
                  <div className="space-y-4">
                    {vehicles.map((vehicle: Vehicle) => (
                      <div key={vehicle.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                {vehicle.plateNumber} - {vehicle.model} ({vehicle.year})
                              </h3>
                              {getStatusBadge(vehicle.status)}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>
                                  {vehicle.lastLat && vehicle.lastLng
                                    ? `${vehicle.lastLat.toFixed(4)}, ${vehicle.lastLng.toFixed(4)}`
                                    : "Position inconnue"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {vehicle.lastUpdate
                                    ? `Mis à jour ${format(new Date(vehicle.lastUpdate), "dd/MM/yyyy HH:mm", {
                                        locale: fr,
                                      })}`
                                    : "Jamais mis à jour"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4" />
                                <span>
                                  {vehicle._count.alerts} alerte{vehicle._count.alerts > 1 ? "s" : ""}
                                </span>
                              </div>
                            </div>

                            {vehicle.currentTrip && (
                              <div className="mt-2 p-2 bg-muted rounded">
                                <p className="text-sm font-medium">Trajet en cours:</p>
                                <p className="text-sm text-muted-foreground">
                                  {vehicle.currentTrip.startPoint} → {vehicle.currentTrip.endPoint}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Chauffeur: {vehicle.currentTrip.driver.name}
                                </p>
                              </div>
                            )}

                            <div className="mt-2 text-sm">
                              <span className="font-medium">Trajets totaux:</span> {vehicle._count.trips}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/manager/fleet/${vehicle.id}`}>Voir détails</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun véhicule trouvé</h3>
                    <p className="text-muted-foreground">
                      {search || statusFilter !== "all"
                        ? "Essayez de modifier vos critères de recherche"
                        : "Aucun véhicule dans la flotte"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
