"use client"

import { useAuth } from "@/lib/auth-context"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Truck, Users, MapPin, AlertTriangle, Calendar, Wrench } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"

interface DashboardStats {
  totalVehicles: number
  activeTrips: number
  totalDrivers: number
  activeAlerts: number
  vehiclesByStatus: Array<{ status: string; count: number }>
  tripsByStatus: Array<{ status: string; count: number }>
  recentTrips: Array<{
    id: string
    startPoint: string
    endPoint: string
    status: string
    driver: { name: string }
    vehicle: { plateNumber: string }
    createdAt: string
  }>
  maintenanceTickets: Array<{
    id: string
    title: string
    status: string
    priority: string
    vehicle: { plateNumber: string }
    scheduledAt: string | null
  }>
}

export default function ManagerDashboard() {
  const { user } = useAuth()

  const { data: stats, isLoading } = useQuery({
    queryKey: ["manager-dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/manager/dashboard")
      if (!response.ok) throw new Error("Failed to fetch dashboard data")
      return response.json()
    },
  })

  const vehicleStatusColors = {
    AVAILABLE: "#34d399",
    IN_USE: "#3b82f6",
    MAINTENANCE: "#f59e0b",
    OUT_OF_SERVICE: "#ef4444",
  }

  const tripStatusColors = {
    PLANNED: "#8b5cf6",
    IN_PROGRESS: "#3b82f6",
    COMPLETED: "#34d399",
    CANCELLED: "#ef4444",
  }

  const getStatusBadge = (status: string, type: "trip" | "maintenance" | "priority") => {
    if (type === "trip") {
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

    if (type === "maintenance") {
      const variants = {
        PENDING: "secondary",
        IN_PROGRESS: "default",
        COMPLETED: "outline",
        CANCELLED: "destructive",
      } as const

      const labels = {
        PENDING: "En attente",
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

    if (type === "priority") {
      const variants = {
        LOW: "outline",
        MEDIUM: "secondary",
        HIGH: "default",
        URGENT: "destructive",
      } as const

      const labels = {
        LOW: "Faible",
        MEDIUM: "Moyenne",
        HIGH: "Élevée",
        URGENT: "Urgente",
      }

      return (
        <Badge variant={variants[status as keyof typeof variants] || "outline"}>
          {labels[status as keyof typeof labels] || status}
        </Badge>
      )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Chargement du tableau de bord...</p>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="trips">Trajets</TabsTrigger>
              <TabsTrigger value="fleet">Flotte</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Véhicules totaux</CardTitle>
                    <Truck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalVehicles || 0}</div>
                    <p className="text-xs text-muted-foreground">Flotte active</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Trajets actifs</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.activeTrips || 0}</div>
                    <p className="text-xs text-muted-foreground">En cours</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Chauffeurs</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalDrivers || 0}</div>
                    <p className="text-xs text-muted-foreground">Équipe</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Alertes actives</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.activeAlerts || 0}</div>
                    <p className="text-xs text-muted-foreground">À traiter</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Statut des véhicules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stats?.vehiclesByStatus || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ status, count }) => `${status}: ${count}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {stats?.vehiclesByStatus?.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={vehicleStatusColors[entry.status as keyof typeof vehicleStatusColors]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Trajets par statut</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats?.tripsByStatus || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Trajets récents</CardTitle>
                    <CardDescription>Derniers trajets créés</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats?.recentTrips?.slice(0, 5).map((trip: any) => (
                        <div key={trip.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">
                              {trip.startPoint} → {trip.endPoint}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {trip.driver.name} • {trip.vehicle.plateNumber}
                            </p>
                          </div>
                          {getStatusBadge(trip.status, "trip")}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Maintenance programmée</CardTitle>
                    <CardDescription>Prochaines interventions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats?.maintenanceTickets?.slice(0, 5).map((ticket: any) => (
                        <div key={ticket.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{ticket.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {ticket.vehicle.plateNumber}
                              {ticket.scheduledAt && ` • ${new Date(ticket.scheduledAt).toLocaleDateString("fr-FR")}`}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {getStatusBadge(ticket.priority, "priority")}
                            {getStatusBadge(ticket.status, "maintenance")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trips">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des trajets</CardTitle>
                  <CardDescription>Planifiez et suivez tous les trajets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Planification des trajets</h3>
                    <p className="text-muted-foreground mb-4">Créez et gérez les trajets de votre flotte</p>
                    <Button asChild>
                      <Link href="/manager/trips">Voir tous les trajets</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fleet">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion de la flotte</CardTitle>
                  <CardDescription>Vue d'ensemble de tous vos véhicules</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Flotte de véhicules</h3>
                    <p className="text-muted-foreground mb-4">Suivez la position et l'état de vos véhicules</p>
                    <Button asChild>
                      <Link href="/manager/fleet">Voir la flotte</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="maintenance">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion de la maintenance</CardTitle>
                  <CardDescription>Planifiez et suivez la maintenance de vos véhicules</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Maintenance préventive</h3>
                    <p className="text-muted-foreground mb-4">Gérez les tickets de maintenance et les révisions</p>
                    <Button asChild>
                      <Link href="/manager/maintenance">Voir la maintenance</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </DashboardLayout>
  )
}
