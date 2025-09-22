import { useQuery } from "@tanstack/react-query"

interface VehiclePosition {
  id: string
  plateNumber: string
  lat: number
  lng: number
  status: string
  lastUpdate: string
}

export function useLiveVehiclePositions() {
  return useQuery({
    queryKey: ["live-vehicle-positions"],
    queryFn: async (): Promise<VehiclePosition[]> => {
      const response = await fetch("/api/fleet/positions")
      if (!response.ok) throw new Error("Failed to fetch vehicle positions")
      return response.json()
    },
    refetchInterval: 10000, // Poll every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
  })
}
