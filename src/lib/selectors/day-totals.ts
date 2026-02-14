import {
  calculateEffectiveProfit,
  calculateTotalDues,
  calculateTotalMoney,
  sumAdvances,
  sumExpenses,
  sumMoneyEntries,
  sumProfit,
  validateMoneyMatch,
} from "@/lib/calculations"
import type { DayLedger } from "@/types/domain"

export type DayTotals = {
  dailyProfit: number
  totalExpenses: number
  effectiveProfit: number
  totalAdvances: number
  totalDues: number
  totalMoney: number
  userMoneySum: number
  totalDistributed: number
  moneyValidation: ReturnType<typeof validateMoneyMatch>
}

export function getDayTotals(day: DayLedger): DayTotals {
  const dailyProfit = sumProfit(day.profits)
  const totalExpenses = sumExpenses(day.expenses)
  const effectiveProfit = calculateEffectiveProfit(dailyProfit, totalExpenses)
  const totalAdvances = sumAdvances(day.advances)
  const totalDues = calculateTotalDues(day.dues)
  const openingBalance = day.openingBalance ?? 0
  const totalMoney = calculateTotalMoney(openingBalance, effectiveProfit, totalAdvances)
  const userMoneySum = sumMoneyEntries(day.moneyEntries)
  const totalDistributed = userMoneySum + totalDues

  return {
    dailyProfit,
    totalExpenses,
    effectiveProfit,
    totalAdvances,
    totalDues,
    totalMoney,
    userMoneySum,
    totalDistributed,
    moneyValidation: validateMoneyMatch(userMoneySum, totalDues, totalMoney),
  }
}

