"use client"

import type React from "react"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Search, Filter, Plus, Wrench, Calendar, DollarSign, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "@/hooks/use-toast"

interface MaintenanceTicket {
  id: string
  title: string
  description: string
  status: string
  priority: string
  scheduledAt: string | null
  completedAt: string | null
  cost: number | null
  createdAt: string
  vehicle: {
    plateNumber: string
    model: string
  }
  assignedTo?: {
    name: string
  }
}

interface Vehicle {
  id: string
  plateNumber: string
  model: string
}

export default function MaintenancePage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    vehicleId: "",
    priority: "MEDIUM",
    scheduledAt: "",
  })

  const queryClient = useQueryClient()

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["maintenance-tickets", search, statusFilter, priorityFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (priorityFilter !== "all") params.append("priority", priorityFilter)

      const response = await fetch(`/api/manager/maintenance?${params}`)
      if (!response.ok) throw new Error("Failed to fetch maintenance tickets")
      return response.json()
    },
  })

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles-for-maintenance"],
    queryFn: async () => {
      const response = await fetch("/api/manager/vehicles")
      if (!response.ok) throw new Error("Failed to fetch vehicles")
      return response.json()
    },
  })

  const createTicketMutation = useMutation({
    mutationFn: async (data: typeof newTicket) => {
      const response = await fetch("/api/manager/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to create maintenance ticket")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-tickets"] })
      setIsCreateDialogOpen(false)
      setNewTicket({
        title: "",
        description: "",
        vehicleId: "",
        priority: "MEDIUM",
        scheduledAt: "",
      })
      toast({ title: "Ticket de maintenance créé avec succès!" })
    },
    onError: () => {
      toast({ title: "Erreur lors de la création du ticket", variant: "destructive" })
    },
  })

  const updateTicketStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/manager/maintenance/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error("Failed to update ticket status")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-tickets"] })
      toast({ title: "Statut mis à jour" })
    },
  })

  const getStatusBadge = (status: string) => {
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

  const getPriorityBadge = (priority: string) => {
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
      <Badge variant={variants[priority as keyof typeof variants] || "outline"}>
        {labels[priority as keyof typeof labels] || priority}
      </Badge>
    )
  }

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault()
    createTicketMutation.mutate(newTicket)
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
              <h1 className="text-xl font-bold">Gestion de la maintenance</h1>
              <p className="text-muted-foreground">Planifiez et suivez la maintenance de vos véhicules</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Créer un ticket de maintenance</DialogTitle>
                  <DialogDescription>Planifiez une intervention de maintenance</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre *</Label>
                    <Input
                      id="title"
                      value={newTicket.title}
                      onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                      placeholder="Ex: Révision 10 000 km"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleId">Véhicule *</Label>
                    <Select
                      value={newTicket.vehicleId}
                      onValueChange={(value) => setNewTicket({ ...newTicket, vehicleId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un véhicule" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles?.map((vehicle: Vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.plateNumber} - {vehicle.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priorité</Label>
                    <Select
                      value={newTicket.priority}
                      onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Faible</SelectItem>
                        <SelectItem value="MEDIUM">Moyenne</SelectItem>
                        <SelectItem value="HIGH">Élevée</SelectItem>
                        <SelectItem value="URGENT">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduledAt">Date prévue</Label>
                    <Input
                      id="scheduledAt"
                      type="datetime-local"
                      value={newTicket.scheduledAt}
                      onChange={(e) => setNewTicket({ ...newTicket, scheduledAt: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                      placeholder="Décrivez l'intervention nécessaire..."
                      required
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={createTicketMutation.isPending || !newTicket.title || !newTicket.vehicleId}
                      className="flex-1"
                    >
                      {createTicketMutation.isPending ? "Création..." : "Créer"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
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
                    placeholder="Rechercher par titre, véhicule..."
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
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                  <SelectItem value="COMPLETED">Terminé</SelectItem>
                  <SelectItem value="CANCELLED">Annulé</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrer par priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les priorités</SelectItem>
                  <SelectItem value="LOW">Faible</SelectItem>
                  <SelectItem value="MEDIUM">Moyenne</SelectItem>
                  <SelectItem value="HIGH">Élevée</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tickets List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Tickets de maintenance
            </CardTitle>
            <CardDescription>
              {tickets?.length || 0} ticket{(tickets?.length || 0) > 1 ? "s" : ""} de maintenance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Chargement des tickets...</p>
            ) : tickets?.length > 0 ? (
              <div className="space-y-4">
                {tickets.map((ticket: MaintenanceTicket) => (
                  <div key={ticket.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{ticket.title}</h3>
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Wrench className="h-4 w-4" />
                            <span>
                              {ticket.vehicle.plateNumber} - {ticket.vehicle.model}
                            </span>
                          </div>
                          {ticket.scheduledAt && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Prévu le {format(new Date(ticket.scheduledAt), "dd/MM/yyyy HH:mm", { locale: fr })}
                              </span>
                            </div>
                          )}
                          {ticket.cost && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{ticket.cost.toFixed(2)} €</span>
                            </div>
                          )}
                        </div>
                        {ticket.assignedTo && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium">Assigné à:</span> {ticket.assignedTo.name}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {ticket.status === "PENDING" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateTicketStatusMutation.mutate({ id: ticket.id, status: "IN_PROGRESS" })}
                            disabled={updateTicketStatusMutation.isPending}
                          >
                            Démarrer
                          </Button>
                        )}
                        {ticket.status === "IN_PROGRESS" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateTicketStatusMutation.mutate({ id: ticket.id, status: "COMPLETED" })}
                            disabled={updateTicketStatusMutation.isPending}
                          >
                            Terminer
                          </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/manager/maintenance/${ticket.id}`}>Détails</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun ticket trouvé</h3>
                <p className="text-muted-foreground mb-4">
                  {search || statusFilter !== "all" || priorityFilter !== "all"
                    ? "Essayez de modifier vos critères de recherche"
                    : "Aucun ticket de maintenance"}
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>Créer un ticket</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
