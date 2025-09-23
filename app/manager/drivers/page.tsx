"use client"

import type React from "react"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Star, MapPin, Calendar, TrendingUp, Users, Award, Clock, Plus, Upload, X } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { toast } from "@/hooks/use-toast"

interface Driver {
  id: string
  name: string
  email: string
  joinedAt: string
  totalTrips: number
  completedTrips: number
  totalDistance: number
  averageRating: number
  thisMonthTrips: number
  lastTripDate: string | null
  status: "DISPONIBLE" | "EN_COURSE"
}

export default function DriversPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    licenseNumber: "",
    licenseExpiryDate: "",
    photoUrl: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    lastMedicalVisit: "",
    notes: "",
  })

  const queryClient = useQueryClient()

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner un fichier image valide",
          variant: "destructive",
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erreur",
          description: "La taille du fichier ne doit pas dépasser 5MB",
          variant: "destructive",
        })
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setPhotoPreview(result)
        setFormData({ ...formData, photoUrl: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setPhotoPreview(null)
    setFormData({ ...formData, photoUrl: "" })
    // Reset file input
    const fileInput = document.getElementById("photo") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const { data: drivers, isLoading } = useQuery({
    queryKey: ["drivers-detailed"],
    queryFn: async () => {
      const response = await fetch("/api/manager/drivers/detailed")
      if (!response.ok) throw new Error("Failed to fetch drivers")
      return response.json() as Promise<Driver[]>
    },
  })

  const createDriverMutation = useMutation({
    mutationFn: async (driverData: typeof formData) => {
      const response = await fetch("/api/manager/drivers/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(driverData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de la création du chauffeur")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers-detailed"] })
      setIsDialogOpen(false)
      setPhotoPreview(null)
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        licenseNumber: "",
        licenseExpiryDate: "",
        photoUrl: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        lastMedicalVisit: "",
        notes: "",
      })
      toast({
        title: "Succès",
        description: "Le chauffeur a été créé avec succès",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.licenseNumber) {
      toast({
        title: "Erreur",
        description: "Tous les champs obligatoires doivent être remplis",
        variant: "destructive",
      })
      return
    }
    createDriverMutation.mutate(formData)
  }

  const filteredDrivers =
    drivers?.filter(
      (driver) =>
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.email.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  const totalDrivers = drivers?.length || 0
  const activeDrivers = drivers?.filter((d) => d.status === "EN_COURSE").length || 0
  const averageRating = drivers?.reduce((sum, d) => sum + d.averageRating, 0) / totalDrivers || 0
  const totalTripsThisMonth = drivers?.reduce((sum, d) => sum + d.thisMonthTrips, 0) || 0

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Chauffeurs</h1>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Chauffeurs</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un chauffeur
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau chauffeur</DialogTitle>
                  <DialogDescription>
                    Remplissez toutes les informations pour créer un nouveau compte chauffeur.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-6 py-4">
                    {/* Informations personnelles */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Informations personnelles</h3>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Nom complet *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Jean Dupont"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="Ex: jean.dupont@zoumai.com"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="phone">Téléphone *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Ex: +33 6 12 34 56 78"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="password">Mot de passe initial *</Label>
                          <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Mot de passe temporaire"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Informations professionnelles */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Informations professionnelles</h3>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="licenseNumber">Numéro de permis de conduire *</Label>
                          <Input
                            id="licenseNumber"
                            value={formData.licenseNumber}
                            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                            placeholder="Ex: 123456789012"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="licenseExpiryDate">Date d'expiration du permis</Label>
                          <Input
                            id="licenseExpiryDate"
                            type="date"
                            value={formData.licenseExpiryDate}
                            onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="photo">Photo du chauffeur</Label>
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <Input
                                id="photo"
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="hidden"
                              />
                              <Label
                                htmlFor="photo"
                                className="flex items-center gap-2 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer transition-colors"
                              >
                                <Upload className="h-4 w-4" />
                                Choisir une photo
                              </Label>
                              <span className="text-sm text-muted-foreground">JPG, PNG, GIF (max 5MB)</span>
                            </div>
                            {photoPreview && (
                              <div className="relative inline-block">
                                <img
                                  src={photoPreview || "/placeholder.svg"}
                                  alt="Aperçu de la photo"
                                  className="w-24 h-24 object-cover rounded-lg border"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                  onClick={removePhoto}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sécurité & santé */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Sécurité & santé</h3>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="emergencyContactName">Contact d'urgence (nom)</Label>
                          <Input
                            id="emergencyContactName"
                            value={formData.emergencyContactName}
                            onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                            placeholder="Ex: Marie Dupont"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="emergencyContactPhone">Téléphone du contact d'urgence</Label>
                          <Input
                            id="emergencyContactPhone"
                            type="tel"
                            value={formData.emergencyContactPhone}
                            onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                            placeholder="Ex: +33 6 98 76 54 32"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="lastMedicalVisit">Date de la dernière visite médicale</Label>
                          <Input
                            id="lastMedicalVisit"
                            type="date"
                            value={formData.lastMedicalVisit}
                            onChange={(e) => setFormData({ ...formData, lastMedicalVisit: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notes complémentaires */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Notes complémentaires</h3>
                      <div className="grid gap-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="Informations complémentaires sur le chauffeur..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" disabled={createDriverMutation.isPending}>
                      {createDriverMutation.isPending ? "Enregistrement..." : "Enregistrer le chauffeur"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Chauffeurs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalDrivers}</div>
                <p className="text-xs text-muted-foreground">{activeDrivers} en cours de trajet</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Note Moyenne</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageRating.toFixed(1)}/5</div>
                <p className="text-xs text-muted-foreground">Satisfaction client</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trajets ce mois</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTripsThisMonth}</div>
                <p className="text-xs text-muted-foreground">Tous chauffeurs confondus</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chauffeurs Actifs</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeDrivers}</div>
                <p className="text-xs text-muted-foreground">En cours de trajet</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un chauffeur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Drivers List */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDrivers.map((driver) => (
              <Card key={driver.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {driver.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{driver.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{driver.email}</p>
                    </div>
                    <Badge
                      variant={driver.status === "EN_COURSE" ? "default" : "secondary"}
                      className={driver.status === "EN_COURSE" ? "bg-green-100 text-green-800" : ""}
                    >
                      {driver.status === "EN_COURSE" ? "En cours" : "Disponible"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Rating */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{driver.averageRating}</span>
                      <span className="text-sm text-muted-foreground">/5</span>
                    </div>
                    <Badge variant="outline" className="bg-yellow-50">
                      <Award className="mr-1 h-3 w-3" />
                      Top performer
                    </Badge>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Trajets totaux</p>
                      <p className="font-medium">{driver.totalTrips}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Complétés</p>
                      <p className="font-medium">{driver.completedTrips}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Distance totale</p>
                      <p className="font-medium">{driver.totalDistance.toLocaleString()} km</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ce mois</p>
                      <p className="font-medium">{driver.thisMonthTrips} trajets</p>
                    </div>
                  </div>

                  {/* Last Activity */}
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {driver.lastTripDate
                        ? `Dernier trajet: ${new Date(driver.lastTripDate).toLocaleDateString("fr-FR")}`
                        : "Aucun trajet récent"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <MapPin className="mr-2 h-4 w-4" />
                      Localiser
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      Détails
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDrivers.length === 0 && !isLoading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun chauffeur trouvé</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm
                    ? "Aucun chauffeur ne correspond à votre recherche."
                    : "Aucun chauffeur n'est enregistré dans le système."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
