"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Bed, Bath, Square } from "lucide-react"

// Set Mapbox access token
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
}

interface Property {
  id: number
  title: string
  price: number
  property_type: string
  bedrooms?: number
  bathrooms?: number
  square_feet?: number
  address: string
  city: string
  state: string
  latitude?: number
  longitude?: number
  images: string[]
  features: string[]
}

interface PropertyMapProps {
  properties: Property[]
  selectedProperty?: Property | null
  onPropertySelect?: (property: Property) => void
  center?: [number, number]
  zoom?: number
  height?: string
}

export function PropertyMap({
  properties,
  selectedProperty,
  onPropertySelect,
  center = [-122.4194, 37.7749], // Default to San Francisco
  zoom = 12,
  height = "500px",
}: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      console.error("Mapbox token not found")
      return
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: center,
      zoom: zoom,
      attributionControl: false,
    })

    map.current.on("load", () => {
      setMapLoaded(true)
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [center, zoom])

  // Update markers when properties change
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove())
    markers.current = []

    // Add new markers
    properties.forEach((property) => {
      if (!property.latitude || !property.longitude) return

      // Create custom marker element
      const markerElement = document.createElement("div")
      markerElement.className = "property-marker"
      markerElement.innerHTML = `
        <div class="w-8 h-8 bg-accent rounded-full border-2 border-background shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform ${
          selectedProperty?.id === property.id ? "ring-2 ring-accent ring-offset-2 ring-offset-background" : ""
        }">
          <div class="w-3 h-3 bg-accent-foreground rounded-full"></div>
        </div>
      `

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([property.longitude, property.latitude])
        .addTo(map.current!)

      // Add click handler
      markerElement.addEventListener("click", () => {
        onPropertySelect?.(property)
      })

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: "property-popup",
      }).setHTML(`
        <div class="p-3 min-w-[250px]">
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-semibold text-sm text-foreground">${property.title}</h3>
            <span class="text-accent font-bold text-sm">$${property.price.toLocaleString()}</span>
          </div>
          <p class="text-xs text-muted-foreground mb-2">${property.address}, ${property.city}</p>
          <div class="flex gap-3 text-xs text-muted-foreground mb-2">
            ${property.bedrooms ? `<span>${property.bedrooms} bed</span>` : ""}
            ${property.bathrooms ? `<span>${property.bathrooms} bath</span>` : ""}
            ${property.square_feet ? `<span>${property.square_feet.toLocaleString()} sqft</span>` : ""}
          </div>
          <div class="flex flex-wrap gap-1">
            ${property.features
              .slice(0, 2)
              .map(
                (feature) =>
                  `<span class="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">${feature}</span>`,
              )
              .join("")}
          </div>
        </div>
      `)

      marker.setPopup(popup)
      markers.current.push(marker)
    })

    // Fit map to show all properties
    if (properties.length > 0) {
      const validProperties = properties.filter((p) => p.latitude && p.longitude)
      if (validProperties.length > 1) {
        const bounds = new mapboxgl.LngLatBounds()
        validProperties.forEach((property) => {
          bounds.extend([property.longitude!, property.latitude!])
        })
        map.current.fitBounds(bounds, { padding: 50 })
      }
    }
  }, [properties, selectedProperty, mapLoaded, onPropertySelect])

  // Center map on selected property
  useEffect(() => {
    if (!map.current || !selectedProperty?.latitude || !selectedProperty?.longitude) return

    map.current.flyTo({
      center: [selectedProperty.longitude, selectedProperty.latitude],
      zoom: 15,
      duration: 1000,
    })
  }, [selectedProperty])

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className="bg-muted rounded-lg flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Map unavailable</p>
          <p className="text-sm text-muted-foreground">Mapbox token required</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div ref={mapContainer} className="w-full rounded-lg overflow-hidden" style={{ height }} />

      {/* Map Legend */}
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-accent rounded-full"></div>
          <span className="text-foreground">Properties ({properties.length})</span>
        </div>
      </div>

      {/* Selected Property Card */}
      {selectedProperty && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80">
          <Card className="bg-card/95 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={selectedProperty.images[0] || "/placeholder.svg"}
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-sm truncate">{selectedProperty.title}</h3>
                    <span className="text-accent font-bold text-sm ml-2">
                      ${selectedProperty.price.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 truncate">
                    {selectedProperty.address}, {selectedProperty.city}
                  </p>
                  <div className="flex gap-3 text-xs text-muted-foreground mb-2">
                    {selectedProperty.bedrooms && (
                      <div className="flex items-center gap-1">
                        <Bed className="w-3 h-3" />
                        <span>{selectedProperty.bedrooms}</span>
                      </div>
                    )}
                    {selectedProperty.bathrooms && (
                      <div className="flex items-center gap-1">
                        <Bath className="w-3 h-3" />
                        <span>{selectedProperty.bathrooms}</span>
                      </div>
                    )}
                    {selectedProperty.square_feet && (
                      <div className="flex items-center gap-1">
                        <Square className="w-3 h-3" />
                        <span>{selectedProperty.square_feet.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  <Button size="sm" className="w-full text-xs">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
