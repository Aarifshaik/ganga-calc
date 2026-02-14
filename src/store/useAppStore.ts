"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { verifyPinHash } from "@/lib/auth/hash"
import { SEEDED_USERS } from "@/lib/auth/seed-users"
import { STORAGE_KEY, STORAGE_VERSION } from "@/lib/constants/storage"
import { getDayKey, isFutureDay } from "@/lib/date/day"
import { getDayTotals } from "@/lib/selectors/day-totals"
import { consumeStorageRecoveryFlag, safeJsonStorage } from "@/lib/storage/safe-json-storage"
import type {
  AdvanceEntry,
  AppCatalogs,
  AuthSession,
  DayLedger,
  DueEntry,
  ExpenseEntry,
  MoneyEntry,
  ProfitEntry,
  User,
} from "@/types/domain"

type ProfitInput = Omit<ProfitEntry, "id" | "createdAt" | "updatedAt"> & { id?: string }
type ExpenseInput = Omit<ExpenseEntry, "id" | "createdAt" | "updatedAt"> & { id?: string }
type AdvanceInput = Omit<AdvanceEntry, "id" | "createdAt" | "updatedAt"> & { id?: string }
type DueInput = Omit<DueEntry, "id" | "createdAt" | "updatedAt"> & { id?: string }
type MoneyInput = Omit<MoneyEntry, "id" | "createdAt" | "updatedAt"> & { id?: string }

export type FinalizeDayResult =
  | { ok: true }
  | { ok: false; reason: "opening_balance_required" }
  | {
      ok: false
      reason: "mismatch"
      expected: number
      entered: number
      difference: number
    }

type AppStoreState = {
  users: User[]
  session: AuthSession | null
  selectedDay: string
  days: Record<string, DayLedger>
  catalogs: AppCatalogs
  storageRecovered: boolean
}

type AppStoreActions = {
  login: (userId: string, pin: string) => Promise<boolean>
  logout: () => void
  setSelectedDay: (dayKey: string) => void
  setOpeningBalance: (value: number) => boolean
  upsertProfit: (input: ProfitInput) => boolean
  deleteProfit: (id: string) => boolean
  upsertExpense: (input: ExpenseInput) => boolean
  deleteExpense: (id: string) => boolean
  upsertAdvance: (input: AdvanceInput) => boolean
  deleteAdvance: (id: string) => boolean
  upsertDue: (input: DueInput) => boolean
  deleteDue: (id: string) => boolean
  upsertMoneyEntry: (input: MoneyInput) => boolean
  deleteMoneyEntry: (id: string) => boolean
  finalizeDay: () => FinalizeDayResult
  dismissStorageRecovered: () => void
  getSelectedDayLedger: () => DayLedger
  getSelectedDayTotals: () => ReturnType<typeof getDayTotals>
  isSelectedDayEditable: () => boolean
  canUseModules: () => boolean
}

export type AppStore = AppStoreState & AppStoreActions

const DEFAULT_CATALOGS: AppCatalogs = {
  agents: [],
  expenseTypes: [],
  moneyLocations: [],
}

function normalizeInt(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.round(value)
}

function getNowIso(): string {
  return new Date().toISOString()
}

function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function createEmptyDayLedger(dayKey: string): DayLedger {
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

function ensureDay(days: Record<string, DayLedger>, dayKey: string): DayLedger {
  return days[dayKey] ?? createEmptyDayLedger(dayKey)
}

function clampDay(dayKey: string): string {
  const today = getDayKey()
  if (isFutureDay(dayKey, today)) {
    return today
  }
  return dayKey
}

function isMutableDay(dayKey: string, day: DayLedger): boolean {
  return dayKey === getDayKey() && !day.isFinalized
}

function appendUniqueCatalogValue(values: string[], rawValue: string): string[] {
  const value = rawValue.trim()
  if (!value) {
    return values
  }

  const exists = values.some((item) => item.toLowerCase() === value.toLowerCase())
  if (exists) {
    return values
  }
  return [...values, value]
}

const initialDay = getDayKey()

const initialState: AppStoreState = {
  users: SEEDED_USERS,
  session: null,
  selectedDay: initialDay,
  days: { [initialDay]: createEmptyDayLedger(initialDay) },
  catalogs: DEFAULT_CATALOGS,
  storageRecovered: false,
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      async login(userId, pin) {
        const user = get().users.find((item) => item.id === userId)
        if (!user) {
          return false
        }
        let isValid = false
        try {
          isValid = await verifyPinHash(pin, user.pinHash)
        } catch {
          return false
        }
        if (!isValid) {
          return false
        }

        set({
          session: {
            userId: user.id,
            loggedInAt: getNowIso(),
          },
        })
        return true
      },
      logout() {
        set({ session: null })
      },
      setSelectedDay(dayKey) {
        const nextDayKey = clampDay(dayKey)
        set((state) => {
          const nextDay = ensureDay(state.days, nextDayKey)
          return {
            ...state,
            selectedDay: nextDayKey,
            days: {
              ...state.days,
              [nextDayKey]: nextDay,
            },
          }
        })
      },
      setOpeningBalance(value) {
        let updated = false
        set((state) => {
          const dayKey = state.selectedDay
          const day = ensureDay(state.days, dayKey)
          if (!isMutableDay(dayKey, day)) {
            return state
          }

          updated = true
          return {
            ...state,
            days: {
              ...state.days,
              [dayKey]: {
                ...day,
                openingBalance: normalizeInt(value),
              },
            },
          }
        })
        return updated
      },
      upsertProfit(input) {
        let updated = false
        set((state) => {
          const dayKey = state.selectedDay
          const day = ensureDay(state.days, dayKey)
          if (!isMutableDay(dayKey, day) || day.openingBalance === null) {
            return state
          }

          const now = getNowIso()
          const existing = input.id ? day.profits.find((entry) => entry.id === input.id) : undefined
          const nextEntry: ProfitEntry = {
            id: existing?.id ?? input.id ?? createId(),
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
            vehicleId: input.vehicleId,
            agentName: input.agentName.trim(),
            meters: normalizeInt(input.meters),
            totalPrice: normalizeInt(input.totalPrice),
          }
          const profits = existing
            ? day.profits.map((entry) => (entry.id === existing.id ? nextEntry : entry))
            : [nextEntry, ...day.profits]

          updated = true
          return {
            ...state,
            days: {
              ...state.days,
              [dayKey]: {
                ...day,
                profits,
              },
            },
            catalogs: {
              ...state.catalogs,
              agents: appendUniqueCatalogValue(state.catalogs.agents, nextEntry.agentName),
            },
          }
        })
        return updated
      },
      deleteProfit(id) {
        let updated = false
        set((state) => {
          const dayKey = state.selectedDay
          const day = ensureDay(state.days, dayKey)
          if (!isMutableDay(dayKey, day) || day.openingBalance === null) {
            return state
          }

          const profits = day.profits.filter((entry) => entry.id !== id)
          if (profits.length === day.profits.length) {
            return state
          }
          updated = true
          return {
            ...state,
            days: {
              ...state.days,
              [dayKey]: {
                ...day,
                profits,
              },
            },
          }
        })
        return updated
      },
      upsertExpense(input) {
        let updated = false
        set((state) => {
          const dayKey = state.selectedDay
          const day = ensureDay(state.days, dayKey)
          if (!isMutableDay(dayKey, day) || day.openingBalance === null) {
            return state
          }

          const now = getNowIso()
          const existing = input.id ? day.expenses.find((entry) => entry.id === input.id) : undefined
          const nextEntry: ExpenseEntry = {
            id: existing?.id ?? input.id ?? createId(),
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
            vehicleId: input.vehicleId,
            expenseType: input.expenseType.trim(),
            amount: normalizeInt(input.amount),
          }
          const expenses = existing
            ? day.expenses.map((entry) => (entry.id === existing.id ? nextEntry : entry))
            : [nextEntry, ...day.expenses]

          updated = true
          return {
            ...state,
            days: {
              ...state.days,
              [dayKey]: {
                ...day,
                expenses,
              },
            },
            catalogs: {
              ...state.catalogs,
              expenseTypes: appendUniqueCatalogValue(state.catalogs.expenseTypes, nextEntry.expenseType),
            },
          }
        })
        return updated
      },
      deleteExpense(id) {
        let updated = false
        set((state) => {
          const dayKey = state.selectedDay
          const day = ensureDay(state.days, dayKey)
          if (!isMutableDay(dayKey, day) || day.openingBalance === null) {
            return state
          }

          const expenses = day.expenses.filter((entry) => entry.id !== id)
          if (expenses.length === day.expenses.length) {
            return state
          }
          updated = true
          return {
            ...state,
            days: {
              ...state.days,
              [dayKey]: {
                ...day,
                expenses,
              },
            },
          }
        })
        return updated
      },
      upsertAdvance(input) {
        let updated = false
        set((state) => {
          const dayKey = state.selectedDay
          const day = ensureDay(state.days, dayKey)
          if (!isMutableDay(dayKey, day) || day.openingBalance === null) {
            return state
          }

          const now = getNowIso()
          const existing = input.id ? day.advances.find((entry) => entry.id === input.id) : undefined
          const nextEntry: AdvanceEntry = {
            id: existing?.id ?? input.id ?? createId(),
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
            name: input.name.trim(),
            details: input.details.trim(),
            amount: normalizeInt(input.amount),
          }
          const advances = existing
            ? day.advances.map((entry) => (entry.id === existing.id ? nextEntry : entry))
            : [nextEntry, ...day.advances]

          updated = true
          return {
            ...state,
            days: {
              ...state.days,
              [dayKey]: {
                ...day,
                advances,
              },
            },
          }
        })
        return updated
      },
      deleteAdvance(id) {
        let updated = false
        set((state) => {
          const dayKey = state.selectedDay
          const day = ensureDay(state.days, dayKey)
          if (!isMutableDay(dayKey, day) || day.openingBalance === null) {
            return state
          }

          const advances = day.advances.filter((entry) => entry.id !== id)
          if (advances.length === day.advances.length) {
            return state
          }
          updated = true
          return {
            ...state,
            days: {
              ...state.days,
              [dayKey]: {
                ...day,
                advances,
              },
            },
          }
        })
        return updated
      },
      upsertDue(input) {
        let updated = false
        set((state) => {
          const dayKey = state.selectedDay
          const day = ensureDay(state.days, dayKey)
          if (!isMutableDay(dayKey, day) || day.openingBalance === null) {
            return state
          }

          const now = getNowIso()
          const existing = input.id ? day.dues.find((entry) => entry.id === input.id) : undefined
          const nextEntry: DueEntry = {
            id: existing?.id ?? input.id ?? createId(),
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
            name: input.name.trim(),
            details: input.details.trim(),
            amount: normalizeInt(input.amount),
          }
          const dues = existing
            ? day.dues.map((entry) => (entry.id === existing.id ? nextEntry : entry))
            : [nextEntry, ...day.dues]

          updated = true
          return {
            ...state,
            days: {
              ...state.days,
              [dayKey]: {
                ...day,
                dues,
              },
            },
          }
        })
        return updated
      },
      deleteDue(id) {
        let updated = false
        set((state) => {
          const dayKey = state.selectedDay
          const day = ensureDay(state.days, dayKey)
          if (!isMutableDay(dayKey, day) || day.openingBalance === null) {
            return state
          }

          const dues = day.dues.filter((entry) => entry.id !== id)
          if (dues.length === day.dues.length) {
            return state
          }
          updated = true
          return {
            ...state,
            days: {
              ...state.days,
              [dayKey]: {
                ...day,
                dues,
              },
            },
          }
        })
        return updated
      },
      upsertMoneyEntry(input) {
        let updated = false
        set((state) => {
          const dayKey = state.selectedDay
          const day = ensureDay(state.days, dayKey)
          if (!isMutableDay(dayKey, day) || day.openingBalance === null) {
            return state
          }

          const now = getNowIso()
          const existing = input.id ? day.moneyEntries.find((entry) => entry.id === input.id) : undefined
          const nextEntry: MoneyEntry = {
            id: existing?.id ?? input.id ?? createId(),
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
            locationName: input.locationName.trim(),
            amount: normalizeInt(input.amount),
          }
          const moneyEntries = existing
            ? day.moneyEntries.map((entry) => (entry.id === existing.id ? nextEntry : entry))
            : [nextEntry, ...day.moneyEntries]

          updated = true
          return {
            ...state,
            days: {
              ...state.days,
              [dayKey]: {
                ...day,
                moneyEntries,
              },
            },
            catalogs: {
              ...state.catalogs,
              moneyLocations: appendUniqueCatalogValue(state.catalogs.moneyLocations, nextEntry.locationName),
            },
          }
        })
        return updated
      },
      deleteMoneyEntry(id) {
        let updated = false
        set((state) => {
          const dayKey = state.selectedDay
          const day = ensureDay(state.days, dayKey)
          if (!isMutableDay(dayKey, day) || day.openingBalance === null) {
            return state
          }

          const moneyEntries = day.moneyEntries.filter((entry) => entry.id !== id)
          if (moneyEntries.length === day.moneyEntries.length) {
            return state
          }
          updated = true
          return {
            ...state,
            days: {
              ...state.days,
              [dayKey]: {
                ...day,
                moneyEntries,
              },
            },
          }
        })
        return updated
      },
      finalizeDay() {
        const state = get()
        const dayKey = state.selectedDay
        const day = ensureDay(state.days, dayKey)
        if (day.isFinalized) {
          return { ok: true }
        }
        if (!isMutableDay(dayKey, day) || day.openingBalance === null) {
          return { ok: false, reason: "opening_balance_required" }
        }

        const totals = getDayTotals(day)
        if (!totals.moneyValidation.matches) {
          return {
            ok: false,
            reason: "mismatch",
            expected: totals.moneyValidation.expected,
            entered: totals.moneyValidation.entered,
            difference: totals.moneyValidation.difference,
          }
        }

        set((previousState) => {
          const previousDay = ensureDay(previousState.days, dayKey)
          if (previousDay.isFinalized) {
            return previousState
          }
          return {
            ...previousState,
            days: {
              ...previousState.days,
              [dayKey]: {
                ...previousDay,
                isFinalized: true,
                finalizedAt: getNowIso(),
              },
            },
          }
        })
        return { ok: true }
      },
      dismissStorageRecovered() {
        set({ storageRecovered: false })
      },
      getSelectedDayLedger() {
        const state = get()
        return ensureDay(state.days, state.selectedDay)
      },
      getSelectedDayTotals() {
        return getDayTotals(get().getSelectedDayLedger())
      },
      isSelectedDayEditable() {
        const state = get()
        const day = ensureDay(state.days, state.selectedDay)
        return isMutableDay(state.selectedDay, day)
      },
      canUseModules() {
        const state = get()
        const day = ensureDay(state.days, state.selectedDay)
        return isMutableDay(state.selectedDay, day) && day.openingBalance !== null
      },
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => safeJsonStorage),
      partialize(state) {
        return {
          session: state.session,
          selectedDay: state.selectedDay,
          days: state.days,
          catalogs: state.catalogs,
        }
      },
      onRehydrateStorage: () => (state) => {
        if (!state || !consumeStorageRecoveryFlag()) {
          return
        }
        useAppStore.setState({ storageRecovered: true })
      },
    }
  )
)
