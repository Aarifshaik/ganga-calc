import type { AdvanceEntry, DueEntry, ExpenseEntry, MoneyEntry, ProfitEntry } from "@/types/domain"

const normalize = (value: number): number => (Number.isFinite(value) ? Math.round(value) : 0)

export function sumProfit(entries: ProfitEntry[]): number {
  return entries.reduce((sum, entry) => sum + normalize(entry.totalPrice), 0)
}

export function sumExpenses(entries: ExpenseEntry[]): number {
  return entries.reduce((sum, entry) => sum + normalize(entry.amount), 0)
}

export function sumAdvances(entries: AdvanceEntry[]): number {
  return entries.reduce((sum, entry) => sum + normalize(entry.amount), 0)
}

export function sumMoneyEntries(entries: MoneyEntry[]): number {
  return entries.reduce((sum, entry) => sum + normalize(entry.amount), 0)
}

export function calculateEffectiveProfit(dailyProfit: number, totalExpenses: number): number {
  return normalize(dailyProfit) - normalize(totalExpenses)
}

export function calculateTotalMoney(openingBalance: number, effectiveProfit: number, totalAdvances: number): number {
  return normalize(openingBalance) + normalize(effectiveProfit) + normalize(totalAdvances)
}

export function calculatePricePerMeter(totalPrice: number, meters: number): number {
  const safeMeters = normalize(meters)
  if (safeMeters <= 0) {
    return 0
  }
  return Math.round(normalize(totalPrice) / safeMeters)
}

export function calculateTotalDues(dues: DueEntry[]): number {
  return dues.reduce((sum, entry) => sum + normalize(entry.amount), 0)
}

export function validateMoneyMatch(userMoneySum: number, totalDues: number, totalMoney: number): {
  matches: boolean
  expected: number
  entered: number
  difference: number
} {
  const expected = normalize(totalMoney)
  const entered = normalize(userMoneySum) + normalize(totalDues)
  const difference = expected - entered
  return {
    matches: difference === 0,
    expected,
    entered,
    difference,
  }
}

