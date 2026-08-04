import {
  getCurrentKstTimestamp,
  getUltraShortObservationBaseTime,
} from "@/lib/date-kst"

const KMA_API_BASE_URL =
  "https://7rqzm44mhamlwowzg2zom55voa0uwvuq.lambda-url.ap-northeast-2.on.aws"

const KMA_API_KEY = "yBHGvX-JQ-WRxr1_iYPl9A"

const DEFAULT_HOSTNAME = "apihub.kma.go.kr"

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface KmaGrid {
  nx: number
  ny: number
  latitude: number
  longitude: number
}

interface UltraShortObservationItem {
  baseDate: string
  baseTime: string
  category: string
  nx: number
  ny: number
  obsrValue: string
}

interface UltraShortObservationResponse {
  response?: {
    header?: {
      resultCode?: string
      resultMsg?: string
    }
    body?: {
      dataType?: string
      items?: {
        item?: UltraShortObservationItem[]
      }
      pageNo?: number
      numOfRows?: number
      totalCount?: number
    }
  }
}

export interface CurrentWeather {
  temperature: number | null
  humidity: number | null
  windSpeed: number | null
  windDirection: number | null
  rainfall: number | null
  precipitationType: number | null
  eastWestWind: number | null
  northSouthWind: number | null
  baseDate: string | null
  baseTime: string | null
  nx: number
  ny: number
}

export interface WeatherWarningItem {
  areaCode: string
  provinceName: string
  districtCode: string
  districtName: string
  announcedAt: string
  effectiveAt: string
  warningType: string
  warningLevel: string
  command: string
  raw: string
}

export interface WeatherWarning {
  raw: string
  hasHeatWarning: boolean
  warnings: WeatherWarningItem[]
  requestedAt: string
}

function buildUrl(
  path: string,
  params: Record<string, string | number | undefined>
) {
  const url = new URL(path, KMA_API_BASE_URL)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  })

  url.searchParams.set("authKey", KMA_API_KEY)

  return url.toString()
}

async function fetchText(url: string, signal?: AbortSignal) {
  const response = await fetch(url, {
    method: "GET",
    signal,
    headers: {
      Accept: "text/plain, application/json",
    },
  })

  if (!response.ok) {
    throw new Error(
      `KMA request failed: ${response.status} ${response.statusText}`
    )
  }

  return response.text()
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    signal,
    headers: {
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(
      `KMA request failed: ${response.status} ${response.statusText}`
    )
  }

  const text = await response.text()

  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error(`KMA returned a non-JSON response: ${text.slice(0, 150)}`)
  }
}

function isValidGridValue(value: number) {
  return Number.isFinite(value) && value > 0 && value < 1000
}

/**
 * KMA grid conversion endpoint returns plain text.
 * This parser supports header-based rows first and falls back to numeric rows.
 */
export function parseGridResponse(
  raw: string,
  coordinates: Coordinates
): KmaGrid {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("#"))

  const headerIndex = lines.findIndex((line) => {
    const normalized = line.toLowerCase()
    return normalized.includes("x") && normalized.includes("y")
  })

  if (headerIndex >= 0 && lines[headerIndex + 1]) {
    const headers = lines[headerIndex]
      .split(/\s+/)
      .map((value) => value.toLowerCase())
    const values = lines[headerIndex + 1].split(/\s+/)

    const xIndex = headers.findIndex((header) => ["x", "nx"].includes(header))
    const yIndex = headers.findIndex((header) => ["y", "ny"].includes(header))

    const nx = Number(values[xIndex])
    const ny = Number(values[yIndex])

    if (isValidGridValue(nx) && isValidGridValue(ny)) {
      return {
        nx,
        ny,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      }
    }
  }

  for (const line of lines) {
    const numbers =
      line
        .match(/-?\d+(?:\.\d+)?/g)
        ?.map(Number)
        .filter(Number.isFinite) ?? []

    // Common format:
    // longitude latitude x y
    if (numbers.length >= 4) {
      const probableX = numbers[numbers.length - 2]
      const probableY = numbers[numbers.length - 1]

      if (isValidGridValue(probableX) && isValidGridValue(probableY)) {
        return {
          nx: Math.round(probableX),
          ny: Math.round(probableY),
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        }
      }
    }

    if (
      numbers.length === 2 &&
      isValidGridValue(numbers[0]) &&
      isValidGridValue(numbers[1])
    ) {
      return {
        nx: Math.round(numbers[0]),
        ny: Math.round(numbers[1]),
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      }
    }
  }

  throw new Error(`Unable to parse the KMA grid response: ${raw.slice(0, 200)}`)
}

export async function getGridFromCoordinates(
  coordinates: Coordinates,
  signal?: AbortSignal
) {
  const url = buildUrl("/api/typ01/cgi-bin/url/nph-dfs_xy_lonlat", {
    lon: coordinates.longitude,
    lat: coordinates.latitude,
    help: 0,
    hostname: DEFAULT_HOSTNAME,
  })

  const raw = await fetchText(url, signal)

  return parseGridResponse(raw, coordinates)
}

function toNullableNumber(value: string | undefined) {
  if (value === undefined || value === "") {
    return null
  }

  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : null
}

export async function getCurrentWeather(
  grid: Pick<KmaGrid, "nx" | "ny">,
  signal?: AbortSignal
): Promise<CurrentWeather> {
  const { baseDate, baseTime } = getUltraShortObservationBaseTime()

  const url = buildUrl(
    "/api/typ02/openApi/VilageFcstInfoService_2.0/getUltraSrtNcst",
    {
      pageNo: 1,
      numOfRows: 1000,
      dataType: "JSON",
      base_date: baseDate,
      base_time: baseTime,
      nx: grid.nx,
      ny: grid.ny,
      hostname: DEFAULT_HOSTNAME,
    }
  )

  const data = await fetchJson<UltraShortObservationResponse>(url, signal)
  const header = data.response?.header

  if (header?.resultCode && header.resultCode !== "00") {
    throw new Error(
      header.resultMsg ?? `KMA returned result code ${header.resultCode}`
    )
  }

  const items = data.response?.body?.items?.item ?? []

  if (items.length === 0) {
    throw new Error(
      `No weather observations found for ${baseDate} ${baseTime}.`
    )
  }

  const byCategory = new Map(items.map((item) => [item.category, item]))

  const referenceItem = items[0]

  return {
    // T1H: Temperature
    temperature: toNullableNumber(byCategory.get("T1H")?.obsrValue),

    // REH: Relative humidity
    humidity: toNullableNumber(byCategory.get("REH")?.obsrValue),

    // WSD: Wind speed
    windSpeed: toNullableNumber(byCategory.get("WSD")?.obsrValue),

    // VEC: Wind direction
    windDirection: toNullableNumber(byCategory.get("VEC")?.obsrValue),

    // RN1: One-hour rainfall
    rainfall: toNullableNumber(byCategory.get("RN1")?.obsrValue),

    // PTY: Precipitation type
    precipitationType: toNullableNumber(byCategory.get("PTY")?.obsrValue),

    // UUU: East-west wind component
    eastWestWind: toNullableNumber(byCategory.get("UUU")?.obsrValue),

    // VVV: North-south wind component
    northSouthWind: toNullableNumber(byCategory.get("VVV")?.obsrValue),

    baseDate: referenceItem?.baseDate ?? baseDate,
    baseTime: referenceItem?.baseTime ?? baseTime,
    nx: grid.nx,
    ny: grid.ny,
  }
}

export async function getWeatherWarnings(
  targetDistrictNames: string[] = [],
  signal?: AbortSignal
): Promise<WeatherWarning> {
  const requestedAt = getCurrentKstTimestamp()

  const url = buildUrl("/api/typ01/url/wrn_now_data_new.php", {
    fe: "e",
    tm: requestedAt,
    help: 0,
    hostname: DEFAULT_HOSTNAME,
  })

  const raw = await fetchText(url, signal)

  const warnings = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("#"))
    .map(parseWarningLine)
    .filter((item): item is WeatherWarningItem => item !== null)
    .filter((item) => item.warningType === "폭염")
    .filter((item) => {
      if (targetDistrictNames.length === 0) {
        return true
      }

      return targetDistrictNames.some(
        (target) =>
          item.districtName === target || item.districtName.includes(target)
      )
    })

  return {
    raw,
    hasHeatWarning: warnings.length > 0,
    warnings,
    requestedAt,
  }
}

function parseWarningLine(line: string): WeatherWarningItem | null {
  const columns = line.split(",").map((value) => value.trim())

  if (columns.length < 8) {
    return null
  }

  const [
    areaCode,
    provinceName,
    districtCode,
    districtName,
    announcedAt,
    effectiveAt,
    warningType,
    warningLevel,
    command = "",
  ] = columns

  if (!areaCode || !districtCode || !warningType) {
    return null
  }

  return {
    areaCode,
    provinceName,
    districtCode,
    districtName,
    announcedAt,
    effectiveAt,
    warningType,
    warningLevel,
    command,
    raw: line,
  }
}
