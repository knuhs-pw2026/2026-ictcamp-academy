const KST_OFFSET_MS = 9 * 60 * 60 * 1000

function pad(value: number, length = 2) {
  return String(value).padStart(length, "0")
}

/**
 * Returns a Date whose UTC getters represent the current KST components.
 */
export function getKstDate(offsetMinutes = 0) {
  return new Date(Date.now() + KST_OFFSET_MS + offsetMinutes * 60 * 1000)
}

export function getUltraShortObservationBaseTime() {
  // KMA data may not be available immediately at the exact hour.
  // Use 40 minutes earlier and truncate to the hour.
  const date = getKstDate(-40)

  const baseDate = [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
  ].join("")

  const baseTime = `${pad(date.getUTCHours())}00`

  return {
    baseDate,
    baseTime,
  }
}

export function getCurrentKstTimestamp() {
  const date = getKstDate()

  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
  ].join("")
}

export function formatKstObservationTime(baseDate?: string, baseTime?: string) {
  if (!baseDate || !baseTime) {
    return "-"
  }

  const year = baseDate.slice(0, 4)
  const month = baseDate.slice(4, 6)
  const day = baseDate.slice(6, 8)
  const hour = baseTime.slice(0, 2)
  const minute = baseTime.slice(2, 4)

  return `${year}.${month}.${day} ${hour}:${minute} KST`
}
