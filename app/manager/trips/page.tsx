"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Search, Filter, MapPin, Clock, User, Truck } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Trip {
  id: string
  startPoint: string
  endPoint: string
  status: string
  startTime: string | null
  endTime: string | null
  distance: number | null
  createdAt: string
  driver: {
    name: string
    email: string
  }
  vehicle: {
    plateNumber: string
    model: string
  }
}

export default function TripsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const { data: trips, isLoading } = useQuery({
    queryKey: ["manager-trips", search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (statusFilter !== "all") params.append("status", statusFilter)

      const response = await fetch(`/api/manager/trips?${params}`)
      if (!response.ok) throw new Error("Failed to fetch trips")
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
              <h1 className="text-xl font-bold">Gestion des trajets</h1>
              <p className="text-muted-foreground">Planifiez et suivez tous les trajets</p>
            </div>
            <Button asChild>
              <Link href="/manager/trips/new">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau trajet
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par destination, chauffeur..."
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
                  <SelectItem value="PLANNED">Planifié</SelectItem>
                  <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                  <SelectItem value="COMPLETED">Terminé</SelectItem>
                  <SelectItem value="CANCELLED">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Trips List */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des trajets</CardTitle>
            <CardDescription>
              {trips?.length || 0} trajet{(trips?.length || 0) > 1 ? "s" : ""} trouvé
              {(trips?.length || 0) > 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Chargement des trajets...</p>
            ) : trips?.length > 0 ? (
              <div className="space-y-4">
                {trips.map((trip: Trip) => (
                  <div key={trip.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {trip.startPoint} → {trip.endPoint}
                          </h3>
                          {getStatusBadge(trip.status)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{trip.driver.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Truck className="h-4 w-4" />
                            <span>
                              {trip.vehicle.plateNumber} ({trip.vehicle.model})
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {trip.startTime
                                ? format(new Date(trip.startTime), "dd/MM/yyyy HH:mm", { locale: fr })
                                : format(new Date(trip.createdAt), "dd/MM/yyyy", { locale: fr })}
                            </span>
                          </div>
                        </div>
                        {trip.distance && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium">Distance:</span> {trip.distance} km
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/manager/trips/${trip.id}`}>Voir détails</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun trajet trouvé</h3>
                <p className="text-muted-foreground mb-4">
                  {search || statusFilter !== "all"
                    ? "Essayez de modifier vos critères de recherche"
                    : "Commencez par créer votre premier trajet"}
                </p>
                <Button asChild>
                  <Link href="/manager/trips/new">Créer un trajet</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
