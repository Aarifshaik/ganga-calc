import { beforeEach, describe, expect, it } from "vitest"

import { getDayKey } from "@/lib/date/day"
import { useAppStore } from "@/store/useAppStore"
import type { DayLedger } from "@/types/domain"

function createDayLedger(dayKey: string): DayLedger {
  return {
    date: dayKey,
    openingBalance: null,
    profits: [],
    expenses: [],
    advances: [],
    dues: [],
    moneyEntries: [],
    isFinalized: false,
    finalizedAt: null,
  }
}

function getYesterdayDayKey(): string {
  const now = new Date()
  now.setDate(now.getDate() - 1)
  return getDayKey(now)
}

function resetStore(): void {
  const today = getDayKey()
  localStorage.clear()
  useAppStore.persist.clearStorage()
  useAppStore.setState({
    session: null,
    selectedDay: today,
    storageRecovered: false,
    catalogs: {
      agents: [],
      expenseTypes: [],
      moneyLocations: [],
    },
    days: {
      [today]: createDayLedger(today),
    },
  })
}

describe("useAppStore guards and finalization", () => {
  beforeEach(() => {
    resetStore()
  })

  it("blocks module mutations until opening balance is set", () => {
    const noOpeningResult = useAppStore.getState().upsertProfit({
      vehicleId: "rig-1",
      agentName: "Agent 1",
      meters: 50,
      totalPrice: 1000,
    })

    expect(noOpeningResult).toBe(false)
    expect(useAppStore.getState().getSelectedDayLedger().profits).toHaveLength(0)

    const openingSaved = useAppStore.getState().setOpeningBalance(0)
    expect(openingSaved).toBe(true)

    const saveResult = useAppStore.getState().upsertProfit({
      vehicleId: "rig-1",
      agentName: "Agent 1",
      meters: 50,
      totalPrice: 1000,
    })
    expect(saveResult).toBe(true)
    expect(useAppStore.getState().getSelectedDayLedger().profits).toHaveLength(1)
  })

  it("blocks mutations on past days", () => {
    const yesterday = getYesterdayDayKey()
    useAppStore.setState((state) => ({
      ...state,
      selectedDay: yesterday,
      days: {
        ...state.days,
        [yesterday]: createDayLedger(yesterday),
      },
    }))

    expect(useAppStore.getState().setOpeningBalance(10)).toBe(false)

    const result = useAppStore.getState().upsertExpense({
      vehicleId: "rig-1",
      expenseType: "Fuel",
      amount: 500,
    })
    expect(result).toBe(false)
    expect(useAppStore.getState().getSelectedDayLedger().expenses).toHaveLength(0)
  })

  it("keeps finalized days immutable", () => {
    useAppStore.getState().setOpeningBalance(0)
    const finalize = useAppStore.getState().finalizeDay()
    expect(finalize).toEqual({ ok: true })
    expect(useAppStore.getState().getSelectedDayLedger().isFinalized).toBe(true)

    const updateAfterFinalize = useAppStore.getState().upsertAdvance({
      name: "Advance 1",
      details: "Test",
      amount: 100,
    })
    expect(updateAfterFinalize).toBe(false)
    expect(useAppStore.getState().getSelectedDayLedger().advances).toHaveLength(0)
  })

  it("returns mismatch details when money equation does not match", () => {
    useAppStore.getState().setOpeningBalance(100)
    useAppStore.getState().upsertMoneyEntry({
      locationName: "Cash",
      amount: 50,
    })

    const result = useAppStore.getState().finalizeDay()
    expect(result).toEqual({
      ok: false,
      reason: "mismatch",
      expected: 100,
      entered: 50,
      difference: 50,
    })
    expect(useAppStore.getState().getSelectedDayLedger().isFinalized).toBe(false)
  })

  it("finalizes successfully when user entries plus auto dues equals total money", () => {
    useAppStore.getState().setOpeningBalance(100)
    useAppStore.getState().upsertDue({
      name: "Customer 1",
      details: "",
      amount: 30,
    })
    useAppStore.getState().upsertMoneyEntry({
      locationName: "Cash",
      amount: 70,
    })

    const result = useAppStore.getState().finalizeDay()
    expect(result).toEqual({ ok: true })
    expect(useAppStore.getState().getSelectedDayLedger().isFinalized).toBe(true)
  })
})

