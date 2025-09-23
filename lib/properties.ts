import { sql } from "./database"
import type { Property } from "./database"

export interface PropertySearchFilters {
  query?: string
  property_type?: string
  min_price?: number
  max_price?: number
  bedrooms?: number
  bathrooms?: number
  min_sqft?: number
  max_sqft?: number
  city?: string
  state?: string
  features?: string[]
  amenities?: string[]
  status?: string
}

export async function searchProperties(
  filters: PropertySearchFilters = {},
  limit = 20,
  offset = 0,
): Promise<{ properties: Property[]; total: number }> {
  const whereConditions: string[] = []
  const params: any[] = []
  let paramIndex = 1

  // Build WHERE conditions dynamically
  if (filters.query) {
    whereConditions.push(`(
      title ILIKE $${paramIndex} OR 
      description ILIKE $${paramIndex} OR 
      address ILIKE $${paramIndex} OR 
      city ILIKE $${paramIndex}
    )`)
    params.push(`%${filters.query}%`)
    paramIndex++
  }

  if (filters.property_type) {
    whereConditions.push(`property_type = $${paramIndex}`)
    params.push(filters.property_type)
    paramIndex++
  }

  if (filters.min_price) {
    whereConditions.push(`price >= $${paramIndex}`)
    params.push(filters.min_price)
    paramIndex++
  }

  if (filters.max_price) {
    whereConditions.push(`price <= $${paramIndex}`)
    params.push(filters.max_price)
    paramIndex++
  }

  if (filters.bedrooms) {
    whereConditions.push(`bedrooms >= $${paramIndex}`)
    params.push(filters.bedrooms)
    paramIndex++
  }

  if (filters.bathrooms) {
    whereConditions.push(`bathrooms >= $${paramIndex}`)
    params.push(filters.bathrooms)
    paramIndex++
  }

  if (filters.min_sqft) {
    whereConditions.push(`square_feet >= $${paramIndex}`)
    params.push(filters.min_sqft)
    paramIndex++
  }

  if (filters.max_sqft) {
    whereConditions.push(`square_feet <= $${paramIndex}`)
    params.push(filters.max_sqft)
    paramIndex++
  }

  if (filters.city) {
    whereConditions.push(`city ILIKE $${paramIndex}`)
    params.push(`%${filters.city}%`)
    paramIndex++
  }

  if (filters.state) {
    whereConditions.push(`state = $${paramIndex}`)
    params.push(filters.state)
    paramIndex++
  }

  if (filters.status) {
    whereConditions.push(`status = $${paramIndex}`)
    params.push(filters.status)
    paramIndex++
  } else {
    // Default to active properties only
    whereConditions.push(`status = 'active'`)
  }

  if (filters.features && filters.features.length > 0) {
    whereConditions.push(`features && $${paramIndex}`)
    params.push(filters.features)
    paramIndex++
  }

  if (filters.amenities && filters.amenities.length > 0) {
    whereConditions.push(`amenities && $${paramIndex}`)
    params.push(filters.amenities)
    paramIndex++
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

  // Get total count
  const countQuery = `SELECT COUNT(*) as total FROM properties ${whereClause}`
  const [{ total }] = await sql.unsafe(countQuery, params)

  // Get properties with pagination
  const propertiesQuery = `
    SELECT p.*, u.name as agent_name, u.phone as agent_phone, u.email as agent_email
    FROM properties p
    LEFT JOIN users u ON p.agent_id = u.id
    ${whereClause}
    ORDER BY p.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `

  const properties = await sql.unsafe(propertiesQuery, [...params, limit, offset])

  return {
    properties: properties as Property[],
    total: Number.parseInt(total),
  }
}

export async function getPropertyById(id: number): Promise<Property | null> {
  const [property] = await sql`
    SELECT p.*, u.name as agent_name, u.phone as agent_phone, u.email as agent_email
    FROM properties p
    LEFT JOIN users u ON p.agent_id = u.id
    WHERE p.id = ${id}
  `

  return (property as Property) || null
}

export async function getFeaturedProperties(limit = 6): Promise<Property[]> {
  const properties = await sql`
    SELECT p.*, u.name as agent_name, u.phone as agent_phone, u.email as agent_email
    FROM properties p
    LEFT JOIN users u ON p.agent_id = u.id
    WHERE p.status = 'active'
    ORDER BY p.created_at DESC
    LIMIT ${limit}
  `

  return properties as Property[]
}

export async function getPropertiesByAgent(agentId: string, limit = 20): Promise<Property[]> {
  const properties = await sql`
    SELECT * FROM properties
    WHERE agent_id = ${agentId} AND status = 'active'
    ORDER BY created_at DESC
    LIMIT ${limit}
  `

  return properties as Property[]
}

export async function createProperty(
  propertyData: Omit<Property, "id" | "created_at" | "updated_at">,
): Promise<Property> {
  const [property] = await sql`
    INSERT INTO properties (
      title, description, price, property_type, status, bedrooms, bathrooms,
      square_feet, lot_size, year_built, address, city, state, zip_code,
      latitude, longitude, features, amenities, images, virtual_tour_url,
      agent_id, seller_id
    )
    VALUES (
      ${propertyData.title}, ${propertyData.description}, ${propertyData.price},
      ${propertyData.property_type}, ${propertyData.status}, ${propertyData.bedrooms},
      ${propertyData.bathrooms}, ${propertyData.square_feet}, ${propertyData.lot_size},
      ${propertyData.year_built}, ${propertyData.address}, ${propertyData.city},
      ${propertyData.state}, ${propertyData.zip_code}, ${propertyData.latitude},
      ${propertyData.longitude}, ${propertyData.features}, ${propertyData.amenities},
      ${propertyData.images}, ${propertyData.virtual_tour_url}, ${propertyData.agent_id},
      ${propertyData.seller_id}
    )
    RETURNING *
  `

  return property as Property
}

export async function updateProperty(id: number, updates: Partial<Property>): Promise<Property> {
  const setClause = Object.keys(updates)
    .filter((key) => key !== "id" && key !== "created_at" && key !== "updated_at")
    .map((key, index) => `${key} = $${index + 2}`)
    .join(", ")

  const values = Object.keys(updates)
    .filter((key) => key !== "id" && key !== "created_at" && key !== "updated_at")
    .map((key) => updates[key as keyof Property])

  const [property] = await sql.unsafe(
    `
    UPDATE properties 
    SET ${setClause}, updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `,
    [id, ...values],
  )

  return property as Property
}
