"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Download, Calendar, TrendingUp, Truck, MapPin, Clock, AlertTriangle } from "lucide-react"
import Link from "next/link"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Mock data for demonstration
const mockTripsData = [
  { month: "Jan", completed: 45, cancelled: 3 },
  { month: "Fév", completed: 52, cancelled: 2 },
  { month: "Mar", completed: 48, cancelled: 4 },
  { month: "Avr", completed: 61, cancelled: 1 },
  { month: "Mai", completed: 55, cancelled: 3 },
  { month: "Juin", completed: 67, cancelled: 2 },
]

const mockVehicleUsage = [
  { name: "Véhicule A", value: 35, color: "#0088FE" },
  { name: "Véhicule B", value: 25, color: "#00C49F" },
  { name: "Véhicule C", value: 20, color: "#FFBB28" },
  { name: "Véhicule D", value: 20, color: "#FF8042" },
]

const mockPerformanceData = [
  { day: "Lun", distance: 245, fuel: 28 },
  { day: "Mar", distance: 312, fuel: 35 },
  { day: "Mer", distance: 189, fuel: 22 },
  { day: "Jeu", distance: 278, fuel: 31 },
  { day: "Ven", distance: 356, fuel: 42 },
  { day: "Sam", distance: 198, fuel: 24 },
  { day: "Dim", distance: 167, fuel: 19 },
]

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("30")

  // Mock query - in real app, this would fetch actual data
  const { data: reportData, isLoading } = useQuery({
    queryKey: ["reports", timeRange],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return {
        totalTrips: 234,
        completedTrips: 218,
        cancelledTrips: 16,
        totalDistance: 12450,
        totalFuelCost: 3240,
        averageDistance: 53.2,
        activeVehicles: 8,
        maintenanceAlerts: 3,
      }
    },
  })

  const completionRate = reportData ? ((reportData.completedTrips / reportData.totalTrips) * 100).toFixed(1) : 0

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
              <h1 className="text-xl font-bold">Rapports et Analyses</h1>
              <p className="text-muted-foreground">Tableau de bord analytique de votre flotte</p>
            </div>
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 derniers jours</SelectItem>
                  <SelectItem value="30">30 derniers jours</SelectItem>
                  <SelectItem value="90">3 derniers mois</SelectItem>
                  <SelectItem value="365">12 derniers mois</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trajets</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : reportData?.totalTrips}</div>
              <p className="text-xs text-muted-foreground">+12% par rapport au mois dernier</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de Réussite</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : `${completionRate}%`}</div>
              <p className="text-xs text-muted-foreground">+2.1% par rapport au mois dernier</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Distance Totale</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : `${reportData?.totalDistance?.toLocaleString()} km`}
              </div>
              <p className="text-xs text-muted-foreground">+8.3% par rapport au mois dernier</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Véhicules Actifs</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : reportData?.activeVehicles}</div>
              <p className="text-xs text-muted-foreground">{reportData?.maintenanceAlerts} alertes de maintenance</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des Trajets</CardTitle>
              <CardDescription>Trajets complétés vs annulés par mois</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockTripsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#0088FE" name="Complétés" />
                  <Bar dataKey="cancelled" fill="#FF8042" name="Annulés" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Utilisation des Véhicules</CardTitle>
              <CardDescription>Répartition de l'utilisation par véhicule</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockVehicleUsage}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mockVehicleUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Hebdomadaire</CardTitle>
            <CardDescription>Distance parcourue et consommation de carburant</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="distance" stroke="#0088FE" name="Distance (km)" />
                <Line yAxisId="right" type="monotone" dataKey="fuel" stroke="#00C49F" name="Carburant (L)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Coûts de Carburant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {isLoading ? "..." : `${reportData?.totalFuelCost?.toLocaleString()} €`}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Moyenne: {isLoading ? "..." : `${(reportData?.totalFuelCost! / reportData?.totalTrips!).toFixed(2)} €`}{" "}
                par trajet
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distance Moyenne</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {isLoading ? "..." : `${reportData?.averageDistance} km`}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Par trajet complété</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Alertes Actives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {isLoading ? "..." : reportData?.maintenanceAlerts}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Maintenance requise</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
