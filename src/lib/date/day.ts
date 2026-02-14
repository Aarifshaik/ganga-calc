const pad = (value: number) => String(value).padStart(2, "0")

export function getDayKey(input: Date = new Date()): string {
  const year = input.getFullYear()
  const month = pad(input.getMonth() + 1)
  const day = pad(input.getDate())
  return `${year}-${month}-${day}`
}

export function isFutureDay(dayKey: string, todayKey: string = getDayKey()): boolean {
  return dayKey > todayKey
}

export function isPastDay(dayKey: string, todayKey: string = getDayKey()): boolean {
  return dayKey < todayKey
}

export function getGreeting(date: Date = new Date()): "Good morning" | "Good afternoon" | "Good evening" {
  const hour = date.getHours()
  if (hour < 12) {
    return "Good morning"
  }
  if (hour < 17) {
    return "Good afternoon"
  }
  return "Good evening"
}

export function toDisplayDay(dayKey: string): string {
  const [year, month, day] = dayKey.split("-").map((value) => Number(value))
  if (!year || !month || !day) {
    return dayKey
  }
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

