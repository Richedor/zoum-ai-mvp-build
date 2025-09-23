"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MapPin,
  AlertTriangle,
  Activity,
  Thermometer,
  Fuel,
  Gauge,
  Shield,
  Wifi,
  Battery,
  Clock,
  Truck,
  Eye,
  RefreshCw,
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import dynamic from "next/dynamic"
import { DashboardLayout } from "@/components/dashboard-layout"

// Dynamic import for MapBox component to avoid SSR issues
const MapBox = dynamic(() => import("@/components/mapbox"), { ssr: false })

interface VehicleMonitoring {
  id: string
  plateNumber: string
  model: string
  status: string
  lastLat: number | null
  lastLng: number | null
  lastUpdate: string | null
  driver?: {
    name: string
  }
  currentTrip?: {
    id: string
    startPoint: string
    endPoint: string
  }
  iotData: {
    speed: number | null
    fuelLevel: number | null
    engineTemp: number | null
    batteryLevel: number | null
    connectionStatus: "ONLINE" | "OFFLINE" | "WEAK"
    lastHeartbeat: string | null
    alcoholLevel: number | null
    fatigueScore: number | null
  }
  alerts: Array<{
    id: string
    type: string
    message: string
    severity: string
    createdAt: string
  }>
}

export default function MonitoringPage() {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [alertFilter, setAlertFilter] = useState("all")
  const [autoRefresh, setAutoRefresh] = useState(true)

  const {
    data: vehicles,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["monitoring-vehicles"],
    queryFn: async () => {
      const response = await fetch("/api/monitoring/vehicles")
      if (!response.ok) throw new Error("Failed to fetch monitoring data")
      return response.json()
    },
    refetchInterval: autoRefresh ? 5000 : false, // Refresh every 5 seconds if auto-refresh is on
  })

  const { data: systemStats } = useQuery({
    queryKey: ["monitoring-stats"],
    queryFn: async () => {
      const response = await fetch("/api/monitoring/stats")
      if (!response.ok) throw new Error("Failed to fetch system stats")
      return response.json()
    },
    refetchInterval: autoRefresh ? 10000 : false,
  })

  // Mock data for demonstration
  useEffect(() => {
    if (!vehicles) {
      // This would normally come from the API
      console.log("[v0] Loading monitoring data...")
    }
  }, [vehicles])

  const getConnectionBadge = (status: string) => {
    const variants = {
      ONLINE: "default",
      OFFLINE: "destructive",
      WEAK: "secondary",
    } as const

    const labels = {
      ONLINE: "En ligne",
      OFFLINE: "Hors ligne",
      WEAK: "Signal faible",
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        <Wifi className="w-3 h-3 mr-1" />
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

  const getAlertTypeIcon = (type: string) => {
    const icons = {
      FATIGUE: Shield,
      ALCOHOL: AlertTriangle,
      SPEED: Gauge,
      MAINTENANCE: Truck,
      FUEL: Fuel,
      TEMPERATURE: Thermometer,
      BATTERY: Battery,
    }
    const Icon = icons[type as keyof typeof icons] || AlertTriangle
    return <Icon className="w-4 h-4" />
  }

  const getFatigueColor = (score: number | null) => {
    if (!score) return "text-muted-foreground"
    if (score < 30) return "text-primary"
    if (score < 70) return "text-yellow-500"
    return "text-destructive"
  }

  const getAlcoholColor = (level: number | null) => {
    if (!level) return "text-muted-foreground"
    if (level === 0) return "text-primary"
    return "text-destructive"
  }

  // Prepare vehicles for map display
  const mapVehicles =
    vehicles
      ?.filter((vehicle: VehicleMonitoring) => vehicle.lastLat && vehicle.lastLng)
      .map((vehicle: VehicleMonitoring) => ({
        id: vehicle.id,
        plateNumber: vehicle.plateNumber,
        lat: vehicle.lastLat!,
        lng: vehicle.lastLng!,
        status: vehicle.status,
      })) || []

  const selectedVehicleData = vehicles?.find((v: VehicleMonitoring) => v.id === selectedVehicle)

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold">Monitoring Temps Réel</h1>
                  <p className="text-muted-foreground">Surveillance IoT de la flotte ZoumAI</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant={autoRefresh ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
                  Auto-refresh
                </Button>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualiser
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="map">Carte temps réel</TabsTrigger>
              <TabsTrigger value="alerts">Alertes</TabsTrigger>
              <TabsTrigger value="iot">Données IoT</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* System Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Véhicules connectés</CardTitle>
                    <Wifi className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{systemStats?.connectedVehicles || 0}</div>
                    <p className="text-xs text-muted-foreground">sur {systemStats?.totalVehicles || 0} véhicules</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Alertes critiques</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-destructive">{systemStats?.criticalAlerts || 0}</div>
                    <p className="text-xs text-muted-foreground">À traiter immédiatement</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Trajets actifs</CardTitle>
                    <Activity className="h-4 w-4 text-accent" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-accent">{systemStats?.activeTrips || 0}</div>
                    <p className="text-xs text-muted-foreground">En cours</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sécurité moyenne</CardTitle>
                    <Shield className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{systemStats?.averageSafetyScore || 0}%</div>
                    <p className="text-xs text-muted-foreground">Score de sécurité</p>
                  </CardContent>
                </Card>
              </div>

              {/* Vehicle Status Grid */}
              <Card>
                <CardHeader>
                  <CardTitle>État des véhicules</CardTitle>
                  <CardDescription>Surveillance en temps réel de tous les véhicules</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p>Chargement des données de monitoring...</p>
                  ) : vehicles?.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                      {vehicles.map((vehicle: VehicleMonitoring) => (
                        <Card
                          key={vehicle.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedVehicle === vehicle.id ? "ring-2 ring-primary" : ""
                          }`}
                          onClick={() => setSelectedVehicle(vehicle.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-semibold flex items-center gap-2">
                                  <Truck className="w-4 h-4" />
                                  {vehicle.plateNumber}
                                </h3>
                                <p className="text-sm text-muted-foreground">{vehicle.model}</p>
                              </div>
                              {getConnectionBadge(vehicle.iotData.connectionStatus)}
                            </div>

                            {vehicle.driver && (
                              <div className="mb-3">
                                <p className="text-sm">
                                  <span className="font-medium">Chauffeur:</span> {vehicle.driver.name}
                                </p>
                              </div>
                            )}

                            {vehicle.currentTrip && (
                              <div className="mb-3 p-2 bg-muted rounded">
                                <p className="text-sm font-medium">Trajet en cours:</p>
                                <p className="text-sm text-muted-foreground">
                                  {vehicle.currentTrip.startPoint} → {vehicle.currentTrip.endPoint}
                                </p>
                              </div>
                            )}

                            {/* IoT Data Summary */}
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-1">
                                <Gauge className="w-3 h-3" />
                                <span>{vehicle.iotData.speed || 0} km/h</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Fuel className="w-3 h-3" />
                                <span>{vehicle.iotData.fuelLevel || 0}%</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Shield className={`w-3 h-3 ${getFatigueColor(vehicle.iotData.fatigueScore)}`} />
                                <span className={getFatigueColor(vehicle.iotData.fatigueScore)}>
                                  Fatigue: {vehicle.iotData.fatigueScore || 0}%
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <AlertTriangle className={`w-3 h-3 ${getAlcoholColor(vehicle.iotData.alcoholLevel)}`} />
                                <span className={getAlcoholColor(vehicle.iotData.alcoholLevel)}>
                                  Alcool: {vehicle.iotData.alcoholLevel || 0}‰
                                </span>
                              </div>
                            </div>

                            {vehicle.alerts.length > 0 && (
                              <div className="mt-3 pt-3 border-t">
                                <div className="flex items-center gap-1 text-sm text-destructive">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>
                                    {vehicle.alerts.length} alerte{vehicle.alerts.length > 1 ? "s" : ""}
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>
                                  Dernière mise à jour:{" "}
                                  {vehicle.lastUpdate
                                    ? format(new Date(vehicle.lastUpdate), "HH:mm:ss", { locale: fr })
                                    : "Jamais"}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Aucun véhicule connecté</h3>
                      <p className="text-muted-foreground">
                        Vérifiez que les boîtiers ZoumAI sont installés et connectés
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="map" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Positions temps réel
                  </CardTitle>
                  <CardDescription>Localisation GPS de tous les véhicules connectés</CardDescription>
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

              {selectedVehicleData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Détails du véhicule sélectionné</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium">Véhicule</p>
                        <p className="text-lg">{selectedVehicleData.plateNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Vitesse</p>
                        <p className="text-lg">{selectedVehicleData.iotData.speed || 0} km/h</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Carburant</p>
                        <p className="text-lg">{selectedVehicleData.iotData.fuelLevel || 0}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Connexion</p>
                        <div className="mt-1">{getConnectionBadge(selectedVehicleData.iotData.connectionStatus)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Alertes système
                      </CardTitle>
                      <CardDescription>Surveillance des alertes de sécurité et maintenance</CardDescription>
                    </div>
                    <Select value={alertFilter} onValueChange={setAlertFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtrer par sévérité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les alertes</SelectItem>
                        <SelectItem value="CRITICAL">Critiques</SelectItem>
                        <SelectItem value="HIGH">Élevées</SelectItem>
                        <SelectItem value="MEDIUM">Moyennes</SelectItem>
                        <SelectItem value="LOW">Faibles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {vehicles?.flatMap((vehicle: VehicleMonitoring) =>
                      vehicle.alerts
                        .filter((alert) => alertFilter === "all" || alert.severity === alertFilter)
                        .map((alert) => (
                          <div key={alert.id} className="flex items-start gap-3 p-4 border rounded-lg">
                            <div className="flex-shrink-0 mt-1">{getAlertTypeIcon(alert.type)}</div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-medium">{alert.message}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Véhicule {vehicle.plateNumber} •{" "}
                                    {format(new Date(alert.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}
                                  </p>
                                </div>
                                {getSeverityBadge(alert.severity)}
                              </div>
                            </div>
                          </div>
                        )),
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="iot" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Données IoT détaillées
                  </CardTitle>
                  <CardDescription>Capteurs et télémétrie des boîtiers ZoumAI</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedVehicleData ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-2">
                              <Gauge className="w-5 h-5 text-accent" />
                              <span className="font-medium">Vitesse</span>
                            </div>
                            <div className="text-2xl font-bold">{selectedVehicleData.iotData.speed || 0} km/h</div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-2">
                              <Fuel className="w-5 h-5 text-blue-500" />
                              <span className="font-medium">Carburant</span>
                            </div>
                            <div className="text-2xl font-bold">{selectedVehicleData.iotData.fuelLevel || 0}%</div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-2">
                              <Thermometer className="w-5 h-5 text-orange-500" />
                              <span className="font-medium">Température moteur</span>
                            </div>
                            <div className="text-2xl font-bold">{selectedVehicleData.iotData.engineTemp || 0}°C</div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-2">
                              <Battery className="w-5 h-5 text-green-500" />
                              <span className="font-medium">Batterie</span>
                            </div>
                            <div className="text-2xl font-bold">{selectedVehicleData.iotData.batteryLevel || 0}%</div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-2">
                              <Shield
                                className={`w-5 h-5 ${getFatigueColor(selectedVehicleData.iotData.fatigueScore)}`}
                              />
                              <span className="font-medium">Score fatigue</span>
                            </div>
                            <div
                              className={`text-2xl font-bold ${getFatigueColor(selectedVehicleData.iotData.fatigueScore)}`}
                            >
                              {selectedVehicleData.iotData.fatigueScore || 0}%
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle
                                className={`w-5 h-5 ${getAlcoholColor(selectedVehicleData.iotData.alcoholLevel)}`}
                              />
                              <span className="font-medium">Taux d'alcool</span>
                            </div>
                            <div
                              className={`text-2xl font-bold ${getAlcoholColor(selectedVehicleData.iotData.alcoholLevel)}`}
                            >
                              {selectedVehicleData.iotData.alcoholLevel || 0}‰
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Sélectionnez un véhicule</h3>
                      <p className="text-muted-foreground">
                        Choisissez un véhicule dans la vue d'ensemble pour voir ses données IoT détaillées
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </DashboardLayout>
  )
}
