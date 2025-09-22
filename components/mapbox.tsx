"use client"

import { MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface Vehicle {
  id: string
  plateNumber: string
  lat: number
  lng: number
  status: string
}

interface MapBoxProps {
  vehicles: Vehicle[]
  center?: { lat: number; lng: number }
  zoom?: number
}

export default function MapBox({ vehicles, center, zoom = 10 }: MapBoxProps) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">Vue des véhicules</h3>
          <p className="text-muted-foreground mb-4">Visualisation simplifiée des positions de la flotte.</p>
          <div className="space-y-2 text-sm">
            <p className="font-medium">Véhicules détectés: {vehicles.length}</p>
            {vehicles.length > 0 && (
              <div className="text-left bg-muted p-3 rounded">
                <p className="font-medium mb-2">Positions:</p>
                {vehicles.slice(0, 3).map((vehicle) => (
                  <div key={vehicle.id} className="flex justify-between text-xs">
                    <span>{vehicle.plateNumber}</span>
                    <span>
                      {vehicle.lat.toFixed(4)}, {vehicle.lng.toFixed(4)}
                    </span>
                  </div>
                ))}
                {vehicles.length > 3 && (
                  <p className="text-xs text-muted-foreground mt-1">+{vehicles.length - 3} autres véhicules</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
