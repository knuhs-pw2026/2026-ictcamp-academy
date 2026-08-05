import { useQuery } from "@tanstack/react-query"

import { getNearbyCoolingShelters } from "@/api/cooling-shelter"

export const DEFAULT_SINDANG_LOCATION = {
  name: "대구 달서구 신당동",
  latitude: 35.855,
  longitude: 128.493,
}

export function useCoolingShelters({
  latitude = DEFAULT_SINDANG_LOCATION.latitude,
  longitude = DEFAULT_SINDANG_LOCATION.longitude,
  radiusKm = 5,
}: {
  latitude?: number
  longitude?: number
  radiusKm?: number
} = {}) {
  return useQuery({
    queryKey: ["cooling-shelters", latitude, longitude, radiusKm],
    queryFn: ({ signal }) =>
      getNearbyCoolingShelters({
        latitude,
        longitude,
        radiusKm,
        limit: 6,
        signal,
      }),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}
