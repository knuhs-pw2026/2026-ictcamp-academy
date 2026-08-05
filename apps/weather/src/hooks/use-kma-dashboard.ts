import { useQuery } from "@tanstack/react-query"

import {
  getCurrentWeather,
  getGridFromCoordinates,
  getWeatherWarnings,
  type Coordinates,
} from "@/api/kma"

export const DEFAULT_LOCATION = {
  name: "대구 달서구 신당동",
  // Replace with the exact coordinate used by your service if necessary.
  latitude: 35.855,
  longitude: 128.493,
} satisfies Coordinates & {
  name: string
}

export function useKmaDashboard(coordinates: Coordinates = DEFAULT_LOCATION) {
  const gridQuery = useQuery({
    queryKey: ["kma", "grid", coordinates.latitude, coordinates.longitude],
    queryFn: ({ signal }) => getGridFromCoordinates(coordinates, signal),
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
  })

  const weatherQuery = useQuery({
    queryKey: ["kma", "weather", gridQuery.data?.nx, gridQuery.data?.ny],
    queryFn: ({ signal }) => {
      if (!gridQuery.data) {
        throw new Error("Grid coordinates are unavailable.")
      }

      return getCurrentWeather(gridQuery.data, signal)
    },
    enabled: gridQuery.isSuccess,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 1,
  })

  const warningQuery = useQuery({
    queryKey: ["kma", "warnings", "대구", "달서구"],
    queryFn: ({ signal }) => getWeatherWarnings(["대구", "달서구"], signal),
    staleTime: 3 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 1,
  })

  return {
    gridQuery,
    weatherQuery,
    warningQuery,
    isLoading:
      gridQuery.isLoading || weatherQuery.isLoading || warningQuery.isLoading,
    isFetching:
      gridQuery.isFetching ||
      weatherQuery.isFetching ||
      warningQuery.isFetching,
    refetchAll: async () => {
      await Promise.all([gridQuery.refetch(), warningQuery.refetch()])

      await weatherQuery.refetch()
    },
  }
}
