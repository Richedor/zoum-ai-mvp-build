import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export { sql }

// Helper functions for common queries
export async function findUserByEmail(email: string) {
  const result = await sql`
    SELECT id, email, name, password, role 
    FROM users 
    WHERE email = ${email}
  `
  return result[0] || null
}

export async function findUserById(id: string) {
  const result = await sql`
    SELECT id, email, name, role 
    FROM users 
    WHERE id = ${id}
  `
  return result[0] || null
}

export async function getDriverTrips(driverId: string) {
  const result = await sql`
    SELECT 
      t.*,
      v.plate_number,
      v.model,
      COUNT(ci.id) as total_checklist_items,
      COUNT(CASE WHEN ci.checked = true THEN 1 END) as completed_checklist_items
    FROM trips t
    LEFT JOIN vehicles v ON t.vehicle_id = v.id
    LEFT JOIN trip_checklist_items ci ON t.id = ci.trip_id
    WHERE t.driver_id = ${driverId}
    GROUP BY t.id, v.plate_number, v.model
    ORDER BY t.created_at DESC
  `
  return result
}

export async function getTripById(tripId: string, driverId?: string) {
  const whereClause = driverId ? sql`WHERE t.id = ${tripId} AND t.driver_id = ${driverId}` : sql`WHERE t.id = ${tripId}`

  const result = await sql`
    SELECT 
      t.*,
      v.*,
      json_agg(
        json_build_object(
          'id', ci.id,
          'checked', ci.checked,
          'notes', ci.notes,
          'template', json_build_object(
            'id', ct.id,
            'name', ct.name,
            'description', ct.description,
            'required', ct.required,
            'order', ct.order
          )
        ) ORDER BY ct.order
      ) as checklist_items
    FROM trips t
    LEFT JOIN vehicles v ON t.vehicle_id = v.id
    LEFT JOIN trip_checklist_items ci ON t.id = ci.trip_id
    LEFT JOIN checklist_item_templates ct ON ci.template_id = ct.id
    ${whereClause}
    GROUP BY t.id, v.id
  `
  return result[0] || null
}

export async function getActiveAlerts(vehicleId?: string, driverId?: string) {
  let whereClause = sql`WHERE a.resolved = false`

  if (vehicleId) {
    whereClause = sql`WHERE a.resolved = false AND a.vehicle_id = ${vehicleId}`
  } else if (driverId) {
    whereClause = sql`
      WHERE a.resolved = false 
      AND a.vehicle_id IN (
        SELECT DISTINCT t.vehicle_id 
        FROM trips t 
        WHERE t.driver_id = ${driverId} 
        AND t.status IN ('PLANNED', 'IN_PROGRESS')
      )
    `
  }

  const result = await sql`
    SELECT 
      a.*,
      v.plate_number,
      v.model
    FROM alerts a
    LEFT JOIN vehicles v ON a.vehicle_id = v.id
    ${whereClause}
    ORDER BY 
      CASE a.severity 
        WHEN 'HIGH' THEN 1 
        WHEN 'MEDIUM' THEN 2 
        WHEN 'LOW' THEN 3 
      END,
      a.created_at DESC
  `
  return result
}
