"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Search, Filter, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "@/hooks/use-toast"

interface Alert {
  id: string
  type: string
  message: string
  severity: string
  resolved: boolean
  createdAt: string
  resolvedAt: string | null
  vehicle: {
    plateNumber: string
    model: string
  }
}

export default function AlertsPage() {
  const [search, setSearch] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("active")

  const queryClient = useQueryClient()

  const { data: alerts, isLoading } = useQuery({
    queryKey: ["manager-alerts", search, severityFilter, activeTab],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append("resolved", activeTab === "resolved" ? "true" : "false")
      if (search) params.append("search", search)
      if (severityFilter !== "all") params.append("severity", severityFilter)

      const response = await fetch(`/api/alerts?${params}`)
      if (!response.ok) throw new Error("Failed to fetch alerts")
      return response.json()
    },
    refetchInterval: 10000, // Refresh every 10 seconds for real-time updates
  })

  const resolveAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetch(`/api/alerts/${alertId}/resolve`, {
        method: "POST",
      })
      if (!response.ok) throw new Error("Failed to resolve alert")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-alerts"] })
      toast({ title: "Alerte résolue avec succès" })
    },
    onError: () => {
      toast({ title: "Erreur lors de la résolution de l'alerte", variant: "destructive" })
    },
  })

  const getSeverityBadge = (severity: string) => {
    const variants = {
      LOW: "outline",
      MEDIUM: "secondary",
      HIGH: "default",
      CRITICAL: "destructive",
    } as const

    const labels = {
      LOW: "Faible",
      MEDIUM: "Moyenne",
      HIGH: "Élevée",
      CRITICAL: "Critique",
    }

    return (
      <Badge variant={variants[severity as keyof typeof variants] || "outline"}>
        {labels[severity as keyof typeof labels] || severity}
      </Badge>
    )
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      MAINTENANCE: "Maintenance",
      FUEL_LOW: "Carburant faible",
      SPEED_LIMIT: "Excès de vitesse",
      GEOFENCE: "Zone géographique",
      ENGINE_WARNING: "Alerte moteur",
      TIRE_PRESSURE: "Pression pneus",
    }
    return labels[type as keyof typeof labels] || type
  }

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
              <h1 className="text-xl font-bold">Gestion des alertes</h1>
              <p className="text-muted-foreground">Surveillez et gérez toutes les alertes de la flotte</p>
            </div>
            <div className="text-sm text-muted-foreground">
              {alerts?.length || 0} alerte{(alerts?.length || 0) > 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alertes actives
            </TabsTrigger>
            <TabsTrigger value="resolved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Alertes résolues
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher par message, véhicule..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filtrer par sévérité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les sévérités</SelectItem>
                      <SelectItem value="LOW">Faible</SelectItem>
                      <SelectItem value="MEDIUM">Moyenne</SelectItem>
                      <SelectItem value="HIGH">Élevée</SelectItem>
                      <SelectItem value="CRITICAL">Critique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Alerts List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {activeTab === "active" ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                  {activeTab === "active" ? "Alertes actives" : "Alertes résolues"}
                </CardTitle>
                <CardDescription>
                  {alerts?.length || 0} alerte{(alerts?.length || 0) > 1 ? "s" : ""}{" "}
                  {activeTab === "active" ? "nécessitant une attention" : "résolues"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p>Chargement des alertes...</p>
                ) : alerts?.length > 0 ? (
                  <div className="space-y-4">
                    {alerts.map((alert: Alert) => (
                      <div key={alert.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{alert.message}</h3>
                              {getSeverityBadge(alert.severity)}
                              <Badge variant="outline">{getTypeLabel(alert.type)}</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4" />
                                <span>
                                  {alert.vehicle.plateNumber} - {alert.vehicle.model}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {alert.resolved && alert.resolvedAt
                                    ? `Résolue le ${format(new Date(alert.resolvedAt), "dd/MM/yyyy HH:mm", {
                                        locale: fr,
                                      })}`
                                    : `Créée le ${format(new Date(alert.createdAt), "dd/MM/yyyy HH:mm", {
                                        locale: fr,
                                      })}`}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!alert.resolved && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => resolveAlertMutation.mutate(alert.id)}
                                disabled={resolveAlertMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Résoudre
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    {activeTab === "active" ? (
                      <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    ) : (
                      <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    )}
                    <h3 className="text-lg font-semibold mb-2">
                      {activeTab === "active" ? "Aucune alerte active" : "Aucune alerte résolue"}
                    </h3>
                    <p className="text-muted-foreground">
                      {search || severityFilter !== "all"
                        ? "Essayez de modifier vos critères de recherche"
                        : activeTab === "active"
                          ? "Toutes les alertes ont été résolues"
                          : "Aucune alerte n'a encore été résolue"}
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
