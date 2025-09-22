"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, MapPin, User, Truck } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

interface Driver {
  id: string
  name: string
  email: string
}

interface Vehicle {
  id: string
  plateNumber: string
  model: string
  status: string
}

export default function NewTripPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    startPoint: "",
    endPoint: "",
    driverId: "",
    vehicleId: "",
    scheduledDate: "",
    scheduledTime: "",
    notes: "",
  })

  const { data: drivers } = useQuery({
    queryKey: ["drivers"],
    queryFn: async () => {
      const response = await fetch("/api/manager/drivers")
      if (!response.ok) throw new Error("Failed to fetch drivers")
      return response.json()
    },
  })

  const { data: vehicles } = useQuery({
    queryKey: ["available-vehicles"],
    queryFn: async () => {
      const response = await fetch("/api/manager/vehicles?status=AVAILABLE")
      if (!response.ok) throw new Error("Failed to fetch vehicles")
      return response.json()
    },
  })

  const createTripMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/manager/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to create trip")
      return response.json()
    },
    onSuccess: (data) => {
      toast({ title: "Trajet créé avec succès!" })
      router.push(`/manager/trips/${data.id}`)
    },
    onError: () => {
      toast({ title: "Erreur lors de la création du trajet", variant: "destructive" })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createTripMutation.mutate(formData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/manager/trips">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">Nouveau trajet</h1>
              <p className="text-muted-foreground">Planifiez un nouveau trajet pour votre flotte</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Informations du trajet
            </CardTitle>
            <CardDescription>Remplissez les détails du nouveau trajet</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Itinéraire */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Itinéraire</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startPoint">Point de départ *</Label>
                    <Input
                      id="startPoint"
                      placeholder="Adresse de départ"
                      value={formData.startPoint}
                      onChange={(e) => handleInputChange("startPoint", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endPoint">Destination *</Label>
                    <Input
                      id="endPoint"
                      placeholder="Adresse de destination"
                      value={formData.endPoint}
                      onChange={(e) => handleInputChange("endPoint", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Assignation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Assignation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="driverId">Chauffeur *</Label>
                    <Select value={formData.driverId} onValueChange={(value) => handleInputChange("driverId", value)}>
                      <SelectTrigger>
                        <User className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Sélectionner un chauffeur" />
                      </SelectTrigger>
                      <SelectContent>
                        {drivers?.map((driver: Driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.name} ({driver.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleId">Véhicule *</Label>
                    <Select value={formData.vehicleId} onValueChange={(value) => handleInputChange("vehicleId", value)}>
                      <SelectTrigger>
                        <Truck className="h-4 w-4 mr-2" />
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
                </div>
              </div>

              {/* Planification */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Planification (optionnel)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDate">Date prévue</Label>
                    <Input
                      id="scheduledDate"
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => handleInputChange("scheduledDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduledTime">Heure prévue</Label>
                    <Input
                      id="scheduledTime"
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => handleInputChange("scheduledTime", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Textarea
                  id="notes"
                  placeholder="Instructions spéciales, remarques..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" asChild className="flex-1 bg-transparent">
                  <Link href="/manager/trips">Annuler</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createTripMutation.isPending ||
                    !formData.startPoint ||
                    !formData.endPoint ||
                    !formData.driverId ||
                    !formData.vehicleId
                  }
                  className="flex-1"
                >
                  {createTripMutation.isPending ? "Création..." : "Créer le trajet"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
