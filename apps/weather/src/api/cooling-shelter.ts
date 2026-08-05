const SAFETY_DATA_API_BASE_URL =
  "https://7rqzm44mhamlwowzg2zom55voa0uwvuq.lambda-url.ap-northeast-2.on.aws"

const SAFETY_DATA_API_KEY = "2T774Y6GUDB46457"

const SAFETY_DATA_HOSTNAME = "www.safetydata.go.kr"

type BooleanFlag = string | number | boolean

export interface CoolingShelterApiItem {
  DTL_ADRES?: string
  XCORD?: string
  LO?: number | string
  CHCK_MATTER_WKEND_HDAY_OPN_AT?: BooleanFlag
  WKEND_HDAY_OPER_BEGIN_TIME?: string
  MODF_TIME?: string
  ARCD?: string
  WKDAY_OPER_BEGIN_TIME?: string
  YEAR?: string
  USE_PSBL_NMPR?: number
  CHCK_MATTER_NIGHT_OPN_AT?: BooleanFlag
  RSTR_NM?: string
  WKEND_HDAY_OPER_END_TIME?: string
  CHCK_MATTER_STAYNG_PSBL_AT?: BooleanFlag
  MNGDPT_CD?: string
  COLR_HOLD_ARCNDTN?: BooleanFlag
  RN_DTL_ADRES?: string
  INPT_TIME?: string
  DTL_POSITION?: string
  WKDAY_OPER_END_TIME?: string
  FCLTY_SCLAS?: string
  COLR_HOLD_ELEFN?: string
  AR?: string
  YCORD?: string
  LA?: number | string
  RSTR_FCLTY_NO?: number
  RM?: string
  FCLTY_TY?: string
}

interface CoolingShelterApiResponse {
  header?: {
    resultMsg?: string
    resultCode?: string
    errorMsg?: string
  }
  numOfRows?: number
  pageNo?: number
  totalCount?: number
  body?: CoolingShelterApiItem[]
}

export interface CoolingShelter {
  id: string
  name: string
  address: string
  roadAddress: string
  latitude: number
  longitude: number
  distanceKm: number
  facilityType: string
  weekdayHours: string | null
  weekendHours: string | null
  capacity: number | null
  hasAirConditioner: boolean | null
  weekendOpen: boolean | null
  nightOpen: boolean | null
  stayAvailable: boolean | null
  detailPosition: string | null
  note: string | null
}

export interface GetCoolingSheltersParams {
  latitude: number
  longitude: number
  radiusKm?: number
  limit?: number
  signal?: AbortSignal
}

function toNumber(value: number | string | undefined) {
  if (value === undefined || value === null || value === "") {
    return null
  }

  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : null
}

function normalizeBoolean(value?: BooleanFlag) {
  if (value === undefined || value === null || value === "") {
    return null
  }

  const normalized = String(value).trim().toUpperCase()

  if (["Y", "YES", "1", "TRUE", "가능", "유"].includes(normalized)) {
    return true
  }

  if (["N", "NO", "0", "FALSE", "불가능", "무"].includes(normalized)) {
    return false
  }

  return null
}

function formatOperatingHours(begin?: string, end?: string): string | null {
  if (!begin && !end) {
    return null
  }

  if (begin && end) {
    return `${formatTime(begin)} ~ ${formatTime(end)}`
  }

  return formatTime(begin ?? end ?? "")
}

function formatTime(value: string) {
  const normalized = value.replace(/[^0-9]/g, "")

  if (normalized.length === 4) {
    return `${normalized.slice(0, 2)}:${normalized.slice(2, 4)}`
  }

  if (normalized.length === 3) {
    return `0${normalized.slice(0, 1)}:${normalized.slice(1, 3)}`
  }

  return value
}

function calculateDistanceKm(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
) {
  const earthRadiusKm = 6371
  const toRadians = (degree: number) => (degree * Math.PI) / 180

  const latitudeDelta = toRadians(latitude2 - latitude1)
  const longitudeDelta = toRadians(longitude2 - longitude1)

  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(latitude1)) *
      Math.cos(toRadians(latitude2)) *
      Math.sin(longitudeDelta / 2) ** 2

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getBoundingBox(latitude: number, longitude: number, radiusKm: number) {
  const latitudeDelta = radiusKm / 111
  const longitudeDelta = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180))

  return {
    startLat: latitude - latitudeDelta,
    endLat: latitude + latitudeDelta,
    startLot: longitude - longitudeDelta,
    endLot: longitude + longitudeDelta,
  }
}

function normalizeShelter(
  item: CoolingShelterApiItem,
  currentLatitude: number,
  currentLongitude: number
): CoolingShelter | null {
  const latitude = toNumber(item.LA ?? item.YCORD)
  const longitude = toNumber(item.LO ?? item.XCORD)

  if (latitude === null || longitude === null) {
    return null
  }

  if (latitude < 30 || latitude > 45 || longitude < 120 || longitude > 135) {
    return null
  }

  return {
    id: String(
      item.RSTR_FCLTY_NO ??
        `${item.RSTR_NM ?? "shelter"}-${latitude}-${longitude}`
    ),
    name: item.RSTR_NM?.trim() || "시설명 미제공",
    address:
      item.RN_DTL_ADRES?.trim() || item.DTL_ADRES?.trim() || "주소 미제공",
    roadAddress: item.RN_DTL_ADRES?.trim() || "",
    latitude,
    longitude,
    distanceKm: calculateDistanceKm(
      currentLatitude,
      currentLongitude,
      latitude,
      longitude
    ),
    facilityType:
      item.FCLTY_TY?.trim() || item.FCLTY_SCLAS?.trim() || "무더위쉼터",
    weekdayHours: formatOperatingHours(
      item.WKDAY_OPER_BEGIN_TIME,
      item.WKDAY_OPER_END_TIME
    ),
    weekendHours: formatOperatingHours(
      item.WKEND_HDAY_OPER_BEGIN_TIME,
      item.WKEND_HDAY_OPER_END_TIME
    ),
    capacity:
      typeof item.USE_PSBL_NMPR === "number" ? item.USE_PSBL_NMPR : null,
    hasAirConditioner: normalizeBoolean(item.COLR_HOLD_ARCNDTN),
    weekendOpen: normalizeBoolean(item.CHCK_MATTER_WKEND_HDAY_OPN_AT),
    nightOpen: normalizeBoolean(item.CHCK_MATTER_NIGHT_OPN_AT),
    stayAvailable: normalizeBoolean(item.CHCK_MATTER_STAYNG_PSBL_AT),
    detailPosition: item.DTL_POSITION?.trim() || null,
    note: item.RM?.trim() || null,
  }
}

export async function getNearbyCoolingShelters({
  latitude,
  longitude,
  radiusKm = 5,
  limit = 6,
  signal,
}: GetCoolingSheltersParams): Promise<CoolingShelter[]> {
  const boundingBox = getBoundingBox(latitude, longitude, radiusKm)

  const url = new URL("/V2/api/DSSP-IF-10942", SAFETY_DATA_API_BASE_URL)

  url.searchParams.set("pageNo", "1")
  url.searchParams.set("numOfRows", "500")
  url.searchParams.set("returnType", "json")
  url.searchParams.set("startLot", String(boundingBox.startLot))
  url.searchParams.set("endLot", String(boundingBox.endLot))
  url.searchParams.set("startLat", String(boundingBox.startLat))
  url.searchParams.set("endLat", String(boundingBox.endLat))
  url.searchParams.set("hostname", SAFETY_DATA_HOSTNAME)
  url.searchParams.set("serviceKey", SAFETY_DATA_API_KEY)

  const response = await fetch(url.toString(), {
    method: "GET",
    signal,
    headers: {
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(
      `무더위쉼터 API 요청 실패: ${response.status} ${response.statusText}`
    )
  }

  const text = await response.text()

  let data: CoolingShelterApiResponse

  try {
    data = JSON.parse(text) as CoolingShelterApiResponse
  } catch {
    throw new Error(
      `무더위쉼터 API가 JSON이 아닌 응답을 반환했습니다: ${text.slice(0, 150)}`
    )
  }

  const resultCode = data.header?.resultCode

  if (resultCode && !["00", "0", "SUCCESS", "INFO-000"].includes(resultCode)) {
    throw new Error(
      data.header?.errorMsg ||
        data.header?.resultMsg ||
        `무더위쉼터 API 오류: ${resultCode}`
    )
  }

  return (data.body ?? [])
    .map((item) => normalizeShelter(item, latitude, longitude))
    .filter(
      (shelter): shelter is CoolingShelter =>
        shelter !== null && shelter.distanceKm <= radiusKm
    )
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit)
}
