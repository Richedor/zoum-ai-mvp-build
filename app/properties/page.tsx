"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Search, MapPin, Home, Grid, List, SlidersHorizontal } from "lucide-react"
import Link from "next/link"

interface Property {
  id: number
  title: string
  description?: string
  price: number
  property_type: string
  bedrooms?: number
  bathrooms?: number
  square_feet?: number
  address: string
  city: string
  state: string
  features: string[]
  amenities: string[]
  images: string[]
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)

  // Search filters
  const [searchQuery, setSearchQuery] = useState("")
  const [propertyType, setPropertyType] = useState("any")
  const [priceRange, setPriceRange] = useState([0, 2000000])
  const [bedrooms, setBedrooms] = useState("any")
  const [bathrooms, setBathrooms] = useState("any")

  // Mock data for now - will be replaced with API calls
  useEffect(() => {
    const mockProperties: Property[] = [
      {
        id: 1,
        title: "Modern Downtown Condo",
        description: "Stunning 2-bedroom condo in the heart of downtown with city views and modern amenities.",
        price: 450000,
        property_type: "condo",
        bedrooms: 2,
        bathrooms: 2,
        square_feet: 1200,
        address: "123 Main St, Unit 15A",
        city: "San Francisco",
        state: "CA",
        features: ["hardwood floors", "granite countertops", "stainless steel appliances", "balcony"],
        amenities: ["gym", "rooftop deck", "concierge", "parking"],
        images: ["/modern-downtown-condo.png"],
      },
      {
        id: 2,
        title: "Charming Victorian House",
        description: "Beautiful 3-bedroom Victorian home with original details and modern updates.",
        price: 675000,
        property_type: "house",
        bedrooms: 3,
        bathrooms: 2.5,
        square_feet: 1800,
        address: "456 Oak Avenue",
        city: "San Francisco",
        state: "CA",
        features: ["original hardwood", "updated kitchen", "garden", "fireplace"],
        amenities: ["parking", "storage"],
        images: ["/victorian-house-exterior.jpg"],
      },
      {
        id: 3,
        title: "Luxury Penthouse Suite",
        description: "Exclusive penthouse with panoramic bay views, 3 bedrooms, and premium finishes.",
        price: 1250000,
        property_type: "condo",
        bedrooms: 3,
        bathrooms: 3,
        square_feet: 2500,
        address: "789 Bay Street, Penthouse",
        city: "San Francisco",
        state: "CA",
        features: ["panoramic views", "marble floors", "wine cellar", "private elevator"],
        amenities: ["valet parking", "spa", "pool", "concierge"],
        images: ["/luxury-penthouse-with-bay-views.jpg"],
      },
      {
        id: 4,
        title: "Cozy Starter Home",
        description: "Perfect first home with 2 bedrooms, updated kitchen, and private backyard.",
        price: 385000,
        property_type: "house",
        bedrooms: 2,
        bathrooms: 1,
        square_feet: 950,
        address: "321 Pine Street",
        city: "Oakland",
        state: "CA",
        features: ["updated kitchen", "private yard", "garage"],
        amenities: ["quiet neighborhood"],
        images: ["/cozy-starter-home.jpg"],
      },
      {
        id: 5,
        title: "Modern Townhouse",
        description: "Brand new 3-bedroom townhouse with contemporary design and smart home features.",
        price: 595000,
        property_type: "townhouse",
        bedrooms: 3,
        bathrooms: 2.5,
        square_feet: 1650,
        address: "654 Elm Drive",
        city: "San Jose",
        state: "CA",
        features: ["smart home", "energy efficient", "two-car garage", "patio"],
        amenities: ["community pool", "playground"],
        images: ["/modern-townhouse.png"],
      },
    ]

    setProperties(mockProperties)
    setLoading(false)
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading properties...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="text-xl font-bold">ZoumAI</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/properties" className="text-foreground font-medium">
                Properties
              </Link>
              <Link href="/agents" className="text-muted-foreground hover:text-foreground transition-colors">
                Agents
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
            </nav>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
              <Button size="sm">Get Started</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search by location, property type, or features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 bg-card border-border"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <Card className="p-6 mb-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Property Type</label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any type</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Bedrooms</label>
                  <Select value={bedrooms} onValueChange={setBedrooms}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Bathrooms</label>
                  <Select value={bathrooms} onValueChange={setBathrooms}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={2000000}
                    min={0}
                    step={25000}
                    className="mt-2"
                  />
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Properties for Sale</h1>
            <p className="text-muted-foreground">{properties.length} properties found</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
              <Grid className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Properties Grid */}
        <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {properties.map((property) => (
            <Card
              key={property.id}
              className={`overflow-hidden hover:shadow-lg transition-shadow ${viewMode === "list" ? "flex" : ""}`}
            >
              <div className={`${viewMode === "list" ? "w-80 flex-shrink-0" : "aspect-video"} bg-muted relative`}>
                <img
                  src={property.images[0] || "/placeholder.svg"}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-3 left-3 bg-accent">{property.property_type}</Badge>
              </div>
              <div className="flex-1">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{property.title}</CardTitle>
                    <span className="text-xl font-bold text-accent">{formatPrice(property.price)}</span>
                  </div>
                  <CardDescription className="flex items-center text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" />
                    {property.address}, {property.city}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {viewMode === "list" && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{property.description}</p>
                  )}
                  <div className="flex justify-between text-sm text-muted-foreground mb-4">
                    <span>{property.bedrooms} bed</span>
                    <span>{property.bathrooms} bath</span>
                    <span>{property.square_feet?.toLocaleString()} sqft</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {property.features.slice(0, 3).map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {property.features.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{property.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                  <Button className="w-full">View Details</Button>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Properties
          </Button>
        </div>
      </div>
    </div>
  )
}
