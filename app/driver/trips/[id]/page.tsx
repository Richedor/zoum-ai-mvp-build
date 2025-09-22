"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, MapPin, Truck, Clock, CheckCircle, Play } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"

interface ChecklistItem {
  id: string
  checked: boolean
  notes: string | null
  template: {
    id: string
    name: string
    description: string
    required: boolean
  }
}

interface Trip {
  id: string
  startPoint: string
  endPoint: string
  status: string
  startTime: string | null
  endTime: string | null
  distance: number | null
  vehicle: {
    id: string
    plateNumber: string
    model: string
    status: string
  }
  checklistItems: ChecklistItem[]
}

export default function TripDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [notes, setNotes] = useState<Record<string, string>>({})

  const { data: trip, isLoading } = useQuery({
    queryKey: ["trip", params.id],
    queryFn: async () => {
      const response = await fetch(`/api/trips/${params.id}`)
      if (!response.ok) throw new Error("Failed to fetch trip")
      return response.json()
    },
  })

  const updateChecklistMutation = useMutation({
    mutationFn: async ({ itemId, checked, notes }: { itemId: string; checked: boolean; notes?: string }) => {
      const response = await fetch(`/api/trips/${params.id}/checklist/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checked, notes }),
      })
      if (!response.ok) throw new Error("Failed to update checklist")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", params.id] })
      toast({ title: "Checklist mise à jour" })
    },
  })

  const startTripMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/trips/${params.id}/start`, {
        method: "POST",
      })
      if (!response.ok) throw new Error("Failed to start trip")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", params.id] })
      toast({ title: "Trajet démarré avec succès!" })
      router.push(`/driver/trips/${params.id}/live`)
    },
  })

  const handleChecklistChange = (itemId: string, checked: boolean) => {
    updateChecklistMutation.mutate({
      itemId,
      checked,
      notes: notes[itemId] || undefined,
    })
  }

  const handleNotesChange = (itemId: string, value: string) => {
    setNotes((prev) => ({ ...prev, [itemId]: value }))
  }

  const handleNotesBlur = (itemId: string) => {
    const item = trip?.checklistItems.find((item: ChecklistItem) => item.id === itemId)
    if (item) {
      updateChecklistMutation.mutate({
        itemId,
        checked: item.checked,
        notes: notes[itemId] || undefined,
      })
    }
  }

  const canStartTrip = () => {
    if (!trip || trip.status !== "PLANNED") return false
    const requiredItems = trip.checklistItems.filter((item: ChecklistItem) => item.template.required)
    return requiredItems.every((item: ChecklistItem) => item.checked)
  }

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Chargement du trajet...</p>
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/driver">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Détails du trajet</h1>
              <p className="text-muted-foreground">
                {trip.startPoint} → {trip.endPoint}
              </p>
            </div>
            {getStatusBadge(trip.status)}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Informations du trajet */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Informations du trajet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Véhicule assigné</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Truck className="h-4 w-4" />
                  <span>
                    {trip.vehicle.plateNumber} - {trip.vehicle.model}
                  </span>
                </div>
              </div>
              {trip.startTime && (
                <div>
                  <Label className="text-sm font-medium">Heure de départ</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4" />
                    <span>{format(new Date(trip.startTime), "dd/MM/yyyy HH:mm", { locale: fr })}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Checklist de départ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Checklist de départ
            </CardTitle>
            <CardDescription>Vérifiez tous les éléments requis avant de démarrer le trajet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {trip.checklistItems.map((item: ChecklistItem) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={item.id}
                    checked={item.checked}
                    onCheckedChange={(checked) => handleChecklistChange(item.id, checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-2">
                    <div>
                      <Label htmlFor={item.id} className="font-medium cursor-pointer">
                        {item.template.name}
                        {item.template.required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      <p className="text-sm text-muted-foreground">{item.template.description}</p>
                    </div>
                    <div>
                      <Label htmlFor={`notes-${item.id}`} className="text-sm">
                        Notes (optionnel)
                      </Label>
                      <Textarea
                        id={`notes-${item.id}`}
                        placeholder="Ajoutez des notes si nécessaire..."
                        value={notes[item.id] || item.notes || ""}
                        onChange={(e) => handleNotesChange(item.id, e.target.value)}
                        onBlur={() => handleNotesBlur(item.id)}
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        {trip.status === "PLANNED" && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    {canStartTrip()
                      ? "Tous les éléments requis sont validés. Vous pouvez démarrer le trajet."
                      : "Veuillez valider tous les éléments requis (*) avant de démarrer le trajet."}
                  </p>
                  <Button
                    onClick={() => startTripMutation.mutate()}
                    disabled={!canStartTrip() || startTripMutation.isPending}
                    size="lg"
                    className="w-full md:w-auto"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {startTripMutation.isPending ? "Démarrage..." : "Valider et démarrer le trajet"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {trip.status === "IN_PROGRESS" && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">Trajet en cours</p>
                <Button asChild size="lg">
                  <Link href={`/driver/trips/${trip.id}/live`}>Voir la carte en temps réel</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
