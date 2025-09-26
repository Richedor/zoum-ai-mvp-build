export const dynamic = "force-dynamic"
export const revalidate = 0

import { NextResponse } from "next/server"

export async function GET() {
  // Mapbox integration disabled for security reasons
  return NextResponse.json(
    {
      token: null,
      message: "Mapbox integration disabled for security reasons",
    },
    { status: 200 },
  )
}
