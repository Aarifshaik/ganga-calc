export function toInteger(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.round(value)
}

export function formatCurrency(value: number): string {
  const amount = toInteger(value)
  return `₦${new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount)}`
}

export function parseIntegerInput(raw: string): number {
  const sanitized = raw.replace(/[^\d-]/g, "")
  if (!sanitized) {
    return 0
  }
  const parsed = Number.parseInt(sanitized, 10)
  if (Number.isNaN(parsed)) {
    return 0
  }
  return parsed
}

